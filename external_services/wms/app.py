from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import socket
import threading

app = FastAPI(title="SwiftLogistics WMS")

DB_NAME = "wms.db"

# ---------------------- Database Setup ----------------------
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # orders table - for warehouse management
    cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE,
            client_name TEXT,
            pickup_location TEXT,
            delivery_location TEXT,
            package_info TEXT,
            status TEXT DEFAULT 'pending',
            driver_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            borrowed_at TIMESTAMP,
            assigned_at TIMESTAMP
        )
    """)
    
    # deliveries table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE,
            delivery_status TEXT,
            address TEXT,
            driver_id TEXT
        )
    """)
    # drivers table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS drivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id TEXT UNIQUE,
            name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            license_number TEXT,
            available INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------------- Models ----------------------
class DeliveryRequest(BaseModel):
    order_id: str
    address: str

class DeliveryResponse(BaseModel):
    order_id: str
    delivery_status: str
    address: str
    driver_id: str

class DriverCreate(BaseModel):
    driver_id: str
    name: str

class DriverSignup(BaseModel):
    name: str
    email: str
    phone: str
    license_number: str

class DriverResponse(BaseModel):
    driver_id: str
    name: str
    email: str
    phone: str
    license_number: str
    available: bool

class OrderCreate(BaseModel):
    order_id: str
    client_name: str
    pickup_location: str
    delivery_location: str
    package_info: str = "Standard Package"

class OrderResponse(BaseModel):
    id: int
    order_id: str
    client_name: str
    pickup_location: str
    delivery_location: str
    package_info: str
    status: str
    driver_id: str | None = None
    driver_name: str | None = None
    created_at: str
    borrowed_at: str | None = None
    assigned_at: str | None = None

class DriverAssignRequest(BaseModel):
    driver_id: str

# ---------------------- TCP/IP Client ----------------------
TCP_HOST = "127.0.0.1"
TCP_PORT = 9000

def tcp_client():
    """Keep a TCP connection open to the protocol server."""
    global tcp_socket
    tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        tcp_socket.connect((TCP_HOST, TCP_PORT))
        print("Connected to TCP protocol server.")
        while True:
            data = tcp_socket.recv(1024)
            if not data:
                break
            print("Received from protocol server:", data.decode())
    except Exception as e:
        print("TCP client error:", e)

threading.Thread(target=tcp_client, daemon=True).start()

def send_tcp_update(message: str):
    try:
        tcp_socket.sendall(message.encode())
    except Exception as e:
        print("Failed to send TCP update:", e)

# ---------------------- Delivery Endpoints ----------------------
@app.post("/deliveries/", response_model=dict)
def create_delivery(req: DeliveryRequest):
    """
    Create an order when placed in CMS.
    Now creates order in pending status for manual warehouse assignment.
    """
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()

    try:
        # Create order record in pending status (extract client name from order_id or use default)
        client_name = f"Client-{req.order_id.split('-')[0] if '-' in req.order_id else req.order_id[:8]}"
        
        cur.execute("""
            INSERT INTO orders (order_id, client_name, pickup_location, delivery_location, package_info, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        """, (req.order_id, client_name, "Pickup Location", req.address, "Standard Package"))
        
        conn.commit()
        conn.close()

        # Send update over TCP/IP
        send_tcp_update(f"New order created: order_id={req.order_id}, status=pending")

        return {"message": "Order created and pending warehouse assignment", "order_id": req.order_id, "status": "pending"}
        
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Order already exists")

@app.get("/deliveries/{order_id}", response_model=DeliveryResponse)
def get_delivery(order_id: str):
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT order_id, delivery_status, address, driver_id FROM deliveries WHERE order_id=?", (order_id,))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Delivery not found")

    return DeliveryResponse(order_id=row[0], delivery_status=row[1], address=row[2], driver_id=row[3])

# ---------------------- Driver Endpoints ----------------------
@app.post("/drivers/", response_model=DriverResponse)
def create_driver(driver: DriverCreate):
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO drivers (driver_id, name, available) VALUES (?, ?, ?)",
                    (driver.driver_id, driver.name, 1))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Driver already exists")
    
    # Get the full driver data
    cur.execute("SELECT driver_id, name, email, phone, license_number, available FROM drivers WHERE driver_id=?", (driver.driver_id,))
    row = cur.fetchone()
    conn.close()
    
    return DriverResponse(
        driver_id=row[0], 
        name=row[1], 
        email=row[2] or "", 
        phone=row[3] or "", 
        license_number=row[4] or "", 
        available=bool(row[5])
    )

@app.post("/drivers/signup", response_model=DriverResponse)
def driver_signup(driver: DriverSignup):
    """
    Driver signup endpoint - creates a new driver account with full details
    """
    import uuid
    
    # Generate unique driver ID
    driver_id = f"DRV{uuid.uuid4().hex[:8].upper()}"
    
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            INSERT INTO drivers (driver_id, name, email, phone, license_number, available) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (driver_id, driver.name, driver.email, driver.phone, driver.license_number, 1))
        conn.commit()
    except sqlite3.IntegrityError as e:
        conn.close()
        if "email" in str(e):
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Driver registration failed")
    
    conn.close()
    
    return DriverResponse(
        driver_id=driver_id,
        name=driver.name,
        email=driver.email,
        phone=driver.phone,
        license_number=driver.license_number,
        available=True
    )

@app.get("/drivers/", response_model=list[DriverResponse])
def list_drivers():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT driver_id, name, email, phone, license_number, available FROM drivers")
    rows = cur.fetchall()
    conn.close()
    return [DriverResponse(
        driver_id=r[0], 
        name=r[1], 
        email=r[2] or "", 
        phone=r[3] or "", 
        license_number=r[4] or "", 
        available=bool(r[5])
    ) for r in rows]

@app.get("/drivers/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: str):
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT driver_id, name, email, phone, license_number, available FROM drivers WHERE driver_id=?", (driver_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Driver not found")
    return DriverResponse(
        driver_id=row[0], 
        name=row[1], 
        email=row[2] or "", 
        phone=row[3] or "", 
        license_number=row[4] or "", 
        available=bool(row[5])
    )

@app.put("/drivers/{driver_id}/availability", response_model=DriverResponse)
def update_driver_availability(driver_id: str, availability_update: dict):
    """
    Update driver availability status.
    Used when deliveries are completed to make drivers available again.
    """
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # Check if driver exists
    cur.execute("SELECT driver_id, name, email, phone, license_number, available FROM drivers WHERE driver_id=?", (driver_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Update availability
    new_availability = 1 if availability_update.get('available', False) else 0
    cur.execute("UPDATE drivers SET available=? WHERE driver_id=?", (new_availability, driver_id))
    conn.commit()
    
    # Get updated driver info
    cur.execute("SELECT driver_id, name, email, phone, license_number, available FROM drivers WHERE driver_id=?", (driver_id,))
    updated_row = cur.fetchone()
    conn.close()
    
    return DriverResponse(
        driver_id=updated_row[0], 
        name=updated_row[1], 
        email=updated_row[2] or "", 
        phone=updated_row[3] or "", 
        license_number=updated_row[4] or "", 
        available=bool(updated_row[5])
    )

@app.get("/drivers/available", response_model=DriverResponse)
def get_available_driver():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT driver_id, name, email, phone, license_number, available FROM drivers WHERE available=1 LIMIT 1")
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="No available drivers")
    return DriverResponse(
        driver_id=row[0], 
        name=row[1], 
        email=row[2] or "", 
        phone=row[3] or "", 
        license_number=row[4] or "", 
        available=bool(row[5])
    )

# ---------------------- Warehouse Management Endpoints ----------------------
@app.get("/orders", response_model=list[OrderResponse])
def get_all_orders():
    """Get all orders for warehouse management"""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("""
        SELECT o.id, o.order_id, o.client_name, o.pickup_location, o.delivery_location,
               o.package_info, o.status, o.driver_id, d.name as driver_name,
               o.created_at, o.borrowed_at, o.assigned_at
        FROM orders o
        LEFT JOIN drivers d ON o.driver_id = d.driver_id
        ORDER BY o.created_at DESC
    """)
    rows = cur.fetchall()
    conn.close()
    
    orders = []
    for row in rows:
        orders.append(OrderResponse(
            id=row[0],
            order_id=row[1],
            client_name=row[2],
            pickup_location=row[3],
            delivery_location=row[4],
            package_info=row[5],
            status=row[6],
            driver_id=row[7],
            driver_name=row[8],
            created_at=row[9],
            borrowed_at=row[10],
            assigned_at=row[11]
        ))
    
    return orders

@app.post("/orders/{order_id}/borrow")
def borrow_order(order_id: str):
    """Borrow an order for processing"""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # Check if order exists and is pending
    cur.execute("SELECT status FROM orders WHERE order_id=?", (order_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")
    
    if row[0] != 'pending':
        conn.close()
        raise HTTPException(status_code=400, detail="Order is not available for borrowing")
    
    # Update order status to borrowed
    cur.execute("UPDATE orders SET status='borrowed', borrowed_at=CURRENT_TIMESTAMP WHERE order_id=?", (order_id,))
    conn.commit()
    conn.close()
    
    send_tcp_update(f"Order borrowed: {order_id}")
    return {"message": "Order borrowed successfully", "order_id": order_id}

@app.post("/orders/{order_id}/assign")
def assign_driver_to_order(order_id: str, request: DriverAssignRequest):
    """Assign a driver to a borrowed order"""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # Check if order exists and is borrowed
    cur.execute("SELECT status FROM orders WHERE order_id=?", (order_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")
    
    if row[0] != 'borrowed':
        conn.close()
        raise HTTPException(status_code=400, detail="Order is not borrowed")
    
    # Check if driver exists and is available
    cur.execute("SELECT available FROM drivers WHERE driver_id=?", (request.driver_id,))
    driver_row = cur.fetchone()
    if not driver_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Driver not found")
    
    if not driver_row[0]:
        conn.close()
        raise HTTPException(status_code=400, detail="Driver is not available")
    
    # Assign driver and update statuses
    cur.execute("UPDATE orders SET status='assigned', driver_id=?, assigned_at=CURRENT_TIMESTAMP WHERE order_id=?", 
                (request.driver_id, order_id))
    cur.execute("UPDATE drivers SET available=0 WHERE driver_id=?", (request.driver_id,))
    
    # Create delivery record
    cur.execute("SELECT delivery_location FROM orders WHERE order_id=?", (order_id,))
    address = cur.fetchone()[0]
    cur.execute("INSERT OR REPLACE INTO deliveries (order_id, delivery_status, address, driver_id) VALUES (?, ?, ?, ?)",
                (order_id, "on the way", address, request.driver_id))
    
    conn.commit()
    conn.close()
    
    send_tcp_update(f"Driver assigned: order_id={order_id}, driver={request.driver_id}")
    return {"message": "Driver assigned successfully", "order_id": order_id, "driver_id": request.driver_id}

@app.post("/orders/{order_id}/return")
def return_order(order_id: str):
    """Return a borrowed or assigned order back to pending"""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # Get current order status and driver
    cur.execute("SELECT status, driver_id FROM orders WHERE order_id=?", (order_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")
    
    status, driver_id = row
    if status not in ['borrowed', 'assigned']:
        conn.close()
        raise HTTPException(status_code=400, detail="Order cannot be returned")
    
    # If assigned, make driver available again
    if status == 'assigned' and driver_id:
        cur.execute("UPDATE drivers SET available=1 WHERE driver_id=?", (driver_id,))
        # Remove delivery record
        cur.execute("DELETE FROM deliveries WHERE order_id=?", (order_id,))
    
    # Reset order to pending
    cur.execute("UPDATE orders SET status='pending', driver_id=NULL, borrowed_at=NULL, assigned_at=NULL WHERE order_id=?", 
                (order_id,))
    conn.commit()
    conn.close()
    
    send_tcp_update(f"Order returned: {order_id}")
    return {"message": "Order returned to pending", "order_id": order_id}

@app.post("/orders", response_model=OrderResponse)
def create_order(order: OrderCreate):
    """Create a new order (called from CMS when client places order)"""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            INSERT INTO orders (order_id, client_name, pickup_location, delivery_location, package_info, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        """, (order.order_id, order.client_name, order.pickup_location, order.delivery_location, order.package_info))
        
        # Get the created order
        cur.execute("""
            SELECT id, order_id, client_name, pickup_location, delivery_location,
                   package_info, status, driver_id, created_at, borrowed_at, assigned_at
            FROM orders WHERE order_id=?
        """, (order.order_id,))
        row = cur.fetchone()
        conn.commit()
        conn.close()
        
        send_tcp_update(f"New order created: {order.order_id}")
        
        return OrderResponse(
            id=row[0],
            order_id=row[1],
            client_name=row[2],
            pickup_location=row[3],
            delivery_location=row[4],
            package_info=row[5],
            status=row[6],
            driver_id=row[7],
            created_at=row[8],
            borrowed_at=row[9],
            assigned_at=row[10]
        )
        
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Order already exists")

@app.post("/orders/{order_id}/delivered")
def mark_order_delivered(order_id: str):
    """Mark order as delivered and make driver available"""
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # Get current order and driver info
    cur.execute("SELECT status, driver_id FROM orders WHERE order_id=?", (order_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")
    
    status, driver_id = row
    if status != 'assigned':
        conn.close()
        raise HTTPException(status_code=400, detail="Order is not assigned")
    
    # Update order status to delivered
    cur.execute("UPDATE orders SET status='delivered' WHERE order_id=?", (order_id,))
    
    # Make driver available again
    if driver_id:
        cur.execute("UPDATE drivers SET available=1 WHERE driver_id=?", (driver_id,))
    
    # Update delivery status
    cur.execute("UPDATE deliveries SET delivery_status='delivered' WHERE order_id=?", (order_id,))
    
    conn.commit()
    conn.close()
    
    send_tcp_update(f"Order delivered: {order_id}, driver {driver_id} now available")
    return {"message": "Order marked as delivered", "order_id": order_id, "driver_id": driver_id}

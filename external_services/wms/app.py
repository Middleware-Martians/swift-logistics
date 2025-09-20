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
            available INTEGER DEFAULT 1
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

class DriverResponse(BaseModel):
    driver_id: str
    name: str
    available: bool

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
@app.post("/deliveries/", response_model=DeliveryResponse)
def create_delivery(req: DeliveryRequest):
    """
    Create a delivery when order placed in CMS.
    Assign an available driver, mark them unavailable, insert delivery into DB.
    """
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()

    # get available driver
    cur.execute("SELECT driver_id FROM drivers WHERE available=1 LIMIT 1")
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="No available drivers")
    driver_id = row[0]

    try:
        cur.execute("INSERT INTO deliveries (order_id, delivery_status, address, driver_id) VALUES (?, ?, ?, ?)",
                    (req.order_id, "on the way", req.address, driver_id))
        # mark driver unavailable
        cur.execute("UPDATE drivers SET available=0 WHERE driver_id=?", (driver_id,))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Order already exists")

    conn.close()

    # Send update over TCP/IP
    send_tcp_update(f"New delivery assigned: order_id={req.order_id}, driver={driver_id}")

    return DeliveryResponse(order_id=req.order_id, delivery_status="on the way",
                            address=req.address, driver_id=driver_id)

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
    conn.close()
    return DriverResponse(driver_id=driver.driver_id, name=driver.name, available=True)

@app.get("/drivers/", response_model=list[DriverResponse])
def list_drivers():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT driver_id, name, available FROM drivers")
    rows = cur.fetchall()
    conn.close()
    return [DriverResponse(driver_id=r[0], name=r[1], available=bool(r[2])) for r in rows]

@app.get("/drivers/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: str):
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT driver_id, name, available FROM drivers WHERE driver_id=?", (driver_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Driver not found")
    return DriverResponse(driver_id=row[0], name=row[1], available=bool(row[2]))

@app.get("/drivers/available", response_model=DriverResponse)
def get_available_driver():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("SELECT driver_id, name, available FROM drivers WHERE available=1 LIMIT 1")
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="No available drivers")
    return DriverResponse(driver_id=row[0], name=row[1], available=bool(row[2]))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import datetime

app = FastAPI(title="ROS - Route Optimisation System")

DB_NAME = "ros.db"

# ---------------------- Database Setup ----------------------
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS delivery_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT,
            latitude REAL,
            longitude REAL,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------------- Models ----------------------
class LocationUpdate(BaseModel):
    order_id: str
    latitude: float
    longitude: float

class LocationResponse(BaseModel):
    order_id: str
    latitude: float
    longitude: float
    timestamp: str

# ---------------------- Endpoints ----------------------

@app.post("/location/update/", response_model=LocationResponse)
def update_location(loc: LocationUpdate):
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    timestamp = datetime.datetime.utcnow().isoformat()
    cur.execute(
        "INSERT INTO delivery_locations (order_id, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)",
        (loc.order_id, loc.latitude, loc.longitude, timestamp)
    )
    conn.commit()
    conn.close()
    return LocationResponse(order_id=loc.order_id, latitude=loc.latitude, longitude=loc.longitude, timestamp=timestamp)

@app.get("/location/{order_id}", response_model=LocationResponse)
def get_location(order_id: str):
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute("""
        SELECT latitude, longitude, timestamp 
        FROM delivery_locations 
        WHERE order_id=? 
        ORDER BY timestamp DESC LIMIT 1
    """, (order_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Location not found")
    return LocationResponse(order_id=order_id, latitude=row[0], longitude=row[1], timestamp=row[2])

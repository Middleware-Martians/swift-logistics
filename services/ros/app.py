# services/ros/app.py
import os
import asyncio
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from aiokafka import AIOKafkaProducer

KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
FIRESTORE_PROJECT = os.getenv("FIRESTORE_PROJECT_ID")
USE_FIRESTORE = bool(FIRESTORE_PROJECT and os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

app = FastAPI(title="ROS Mock Service")
producer = None

class LocationUpdate(BaseModel):
    location: str  # e.g., "Zone A", "Node 12" or coordinates as a string
    timestamp: str | None = None

@app.on_event("startup")
async def startup():
    global producer
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP)
    await producer.start()

@app.on_event("shutdown")
async def shutdown():
    global producer
    if producer:
        await producer.stop()

@app.post("/drivers/{driver_id}/location")
async def post_location(driver_id: int, data: LocationUpdate):
    # Produce to Kafka
    payload = {"driver_id": driver_id, "location": data.location, "timestamp": data.timestamp}
    await producer.send_and_wait("routes.updates", json.dumps(payload).encode())

    # Optional: store in Firestore if configured
    if USE_FIRESTORE:
        try:
            from google.cloud import firestore
            db = firestore.Client(project=FIRESTORE_PROJECT)
            doc_ref = db.collection("driverLocations").document(str(driver_id))
            doc_ref.set(payload)
        except Exception as e:
            # don't fail the request if firestore write fails in dev
            print("Firestore write failed:", e)
    else:
        # dev fallback: write to a local JSON file for quick inspection
        try:
            p = "/data/driver_locations.json"
            os.makedirs("/data", exist_ok=True)
            if os.path.exists(p):
                with open(p, "r") as f:
                    d = json.load(f)
            else:
                d = {}
            d[str(driver_id)] = payload
            with open(p, "w") as f:
                json.dump(d, f, indent=2)
        except Exception:
            pass

    return {"ok": True, "emitted": payload}

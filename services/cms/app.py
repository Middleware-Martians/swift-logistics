# app.py (CMS)
import os
import asyncio
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from aiokafka import AIOKafkaProducer

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://swift:swiftpass@localhost:5432/swiftdb")
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

app = FastAPI(title="CMS Service (mock)")

# Async SQLAlchemy engine + session
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Kafka producer (global)
producer = None

class SignupIn(BaseModel):
    username: str
    email: str
    password: str

class OrderIn(BaseModel):
    client_id: int
    pickup_location: str
    dropoff_location: str

@app.on_event("startup")
async def startup_event():
    global producer
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP)
    await producer.start()

@app.on_event("shutdown")
async def shutdown_event():
    global producer
    if producer:
        await producer.stop()
    await engine.dispose()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.post("/signup")
async def signup(data: SignupIn, db=Depends(get_db)):
    hashed = "pass:"+data.password  # for mock only; use bcrypt/proper hashing
    q = text("INSERT INTO users (username,email,password_hash,role) VALUES (:u,:e,:p,'client') RETURNING id")
    res = await db.execute(q, {"u": data.username, "e": data.email, "p": hashed})
    await db.commit()
    r = res.fetchone()
    return {"id": r[0], "username": data.username}

@app.post("/orders")
async def create_order(order: OrderIn, db=Depends(get_db)):
    q = text("INSERT INTO orders (client_id, pickup_location, dropoff_location) VALUES (:c,:pl,:dl) RETURNING id, status")
    res = await db.execute(q, {"c": order.client_id, "pl": order.pickup_location, "dl": order.dropoff_location})
    await db.commit()
    r = res.fetchone()
    order_id = r[0]
    # Publish to Kafka for async processing (WMS/ROS)
    await producer.send_and_wait("orders", (f'{{"order_id":{order_id},"client_id":{order.client_id}}}').encode())
    return {"order_id": order_id, "status": r[1]}

@app.get("/orders/{order_id}")
async def get_order(order_id: int, db=Depends(get_db)):
    q = text("SELECT id, client_id, status, pickup_location, dropoff_location, created_at FROM orders WHERE id=:id")
    res = await db.execute(q, {"id": order_id})
    row = res.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")
    return dict(zip(["id", "client_id", "status", "pickup_location","dropoff_location","created_at"], row))

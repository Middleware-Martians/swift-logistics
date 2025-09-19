# services/wms/app.py
import os
import asyncio
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://swift:swiftpass@postgres:5432/swiftdb")
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_CONSUMER_GROUP = os.getenv("KAFKA_CONSUMER_GROUP", "wms-group")

app = FastAPI(title="WMS Mock Service")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

consumer = None
producer = None
_consume_task = None
_running = True

class StatusUpdate(BaseModel):
    status: str

class TCPEvent(BaseModel):
    order_id: int
    event: str
    meta: dict = {}

@app.on_event("startup")
async def startup():
    global consumer, producer, _consume_task
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP)
    await producer.start()
    consumer = AIOKafkaConsumer(
        "orders",
        bootstrap_servers=KAFKA_BOOTSTRAP,
        group_id=KAFKA_CONSUMER_GROUP,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
    )
    await consumer.start()
    _consume_task = asyncio.create_task(consume_orders_loop())
    app.state.engine = engine

@app.on_event("shutdown")
async def shutdown():
    global _running
    _running = False
    if consumer:
        await consumer.stop()
    if producer:
        await producer.stop()
    await engine.dispose()
    if _consume_task:
        _consume_task.cancel()

async def consume_orders_loop():
    try:
        async for msg in consumer:
            try:
                payload = msg.value.decode()
                # assume CMS produced JSON like {"order_id": 5, "client_id": 1}
                data = json.loads(payload)
                order_id = data.get("order_id")
                if order_id is None:
                    continue
                # Update order status in Postgres
                async with AsyncSessionLocal() as session:
                    await session.execute(
                        text("UPDATE orders SET status=:s, updated_at=now() WHERE id=:id"),
                        {"s": "processing", "id": order_id},
                    )
                    await session.commit()
                # publish wms event
                await producer.send_and_wait("wms.events", json.dumps({"order_id": order_id, "status": "processing"}).encode())
            except Exception as e:
                print("Error processing order message:", e)
    except asyncio.CancelledError:
        return

@app.post("/internal/tcp_event")
async def tcp_event(ev: TCPEvent):
    """
    Endpoint used by the TCP adapter (via MI) to post proprietary events.
    Example body: {"order_id": 1, "event": "scanned", "meta": {"location":"WH1"}}
    """
    # basic validation
    if ev.order_id is None:
        raise HTTPException(status_code=400, detail="order_id required")
    # Update DB or set a custom status
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("UPDATE orders SET status=:s, updated_at=now() WHERE id=:id"),
            {"s": f"event:{ev.event}", "id": ev.order_id},
        )
        await session.commit()
    # publish to Kafka
    await producer.send_and_wait("wms.events", json.dumps({"order_id": ev.order_id, "event": ev.event, "meta": ev.meta}).encode())
    return {"ok": True}

@app.post("/orders/{order_id}/status")
async def update_status(order_id: int, payload: StatusUpdate):
    async with AsyncSessionLocal() as session:
        await session.execute(text("UPDATE orders SET status=:s, updated_at=now() WHERE id=:id"), {"s": payload.status, "id": order_id})
        await session.commit()
    await producer.send_and_wait("wms.events", json.dumps({"order_id": order_id, "status": payload.status}).encode())
    return {"ok": True}

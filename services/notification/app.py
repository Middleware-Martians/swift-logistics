# services/notification/app.py
import os
import asyncio
import json
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("notification-service")

# Configuration from environment variables
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_CONSUMER_GROUP = os.getenv("KAFKA_CONSUMER_GROUP", "notification-group")
SMS_API_KEY = os.getenv("SMS_API_KEY", "dummy-key")
EMAIL_API_KEY = os.getenv("EMAIL_API_KEY", "dummy-key")

app = FastAPI(title="Notification Service")

# Global state
consumer = None
_consume_task = None
_running = True
notification_queue = asyncio.Queue()

class NotificationRequest(BaseModel):
    recipient: str  # Email or phone number
    message: str
    type: str = "email"  # "email" or "sms"
    
class NotificationStatus(BaseModel):
    total_processed: int = 0
    total_failed: int = 0
    queue_size: int = 0
    is_running: bool = True

# In-memory tracking of notifications for demonstration
notification_stats = NotificationStatus()

@app.on_event("startup")
async def startup():
    global consumer, _consume_task
    
    # Set up Kafka consumer
    consumer = AIOKafkaConsumer(
        "wms.events",  # Listen to WMS events
        "routes.updates",  # Listen to route updates
        bootstrap_servers=KAFKA_BOOTSTRAP,
        group_id=KAFKA_CONSUMER_GROUP,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
    )
    
    await consumer.start()
    logger.info("Kafka consumer started")
    
    # Start background tasks
    _consume_task = asyncio.create_task(consume_messages_loop())
    asyncio.create_task(process_notification_queue())
    logger.info("Background tasks started")

@app.on_event("shutdown")
async def shutdown():
    global _running
    _running = False
    if consumer:
        await consumer.stop()
    if _consume_task:
        _consume_task.cancel()
    logger.info("Service shutdown")

async def consume_messages_loop():
    """Consume messages from Kafka topics and process them"""
    try:
        async for msg in consumer:
            try:
                # Process message based on topic
                topic = msg.topic
                payload = json.loads(msg.value.decode())
                logger.info(f"Received message from topic {topic}: {payload}")
                
                # Generate notification based on event type
                if topic == "wms.events":
                    await handle_wms_event(payload)
                elif topic == "routes.updates":
                    await handle_route_update(payload)
                
            except json.JSONDecodeError:
                logger.error(f"Failed to decode JSON: {msg.value}")
            except Exception as e:
                logger.error(f"Error processing message: {e}", exc_info=True)
                
    except asyncio.CancelledError:
        logger.info("Consume task cancelled")
    except Exception as e:
        logger.error(f"Unexpected error in consume loop: {e}", exc_info=True)

async def handle_wms_event(payload):
    """Process WMS event messages"""
    order_id = payload.get("order_id")
    status = payload.get("status")
    event = payload.get("event")
    
    if not order_id:
        return
    
    # In a real system, we'd look up customer contact info from a database
    # For this mock, we'll just generate a notification with order info
    
    # Determine notification content based on status/event
    if status == "processing":
        message = f"Your order #{order_id} is now being processed."
    elif event == "scanned":
        location = payload.get("meta", {}).get("location", "warehouse")
        message = f"Your order #{order_id} has been scanned at {location}."
    else:
        message = f"Update on your order #{order_id}: {status or event}"
    
    # Queue notification (mock recipient)
    await notification_queue.put(
        NotificationRequest(
            recipient="customer@example.com",
            message=message,
            type="email"
        )
    )

async def handle_route_update(payload):
    """Process route update messages"""
    driver_id = payload.get("driver_id")
    location = payload.get("location")
    
    if not driver_id or not location:
        return
    
    # In a real system, we might notify the customer when their driver is nearby
    # For this mock, we'll just log it
    logger.info(f"Driver {driver_id} location updated to {location}")

async def process_notification_queue():
    """Process notifications from the queue"""
    while _running:
        try:
            if not notification_queue.empty():
                notification = await notification_queue.get()
                await send_notification(notification)
                notification_queue.task_done()
            else:
                await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Error processing notification queue: {e}", exc_info=True)

async def send_notification(notification: NotificationRequest):
    """Send a notification via the appropriate channel"""
    try:
        logger.info(f"Sending {notification.type} to {notification.recipient}: {notification.message}")
        
        # Simulate API call to notification provider
        if notification.type == "email":
            # Mock email sending
            await asyncio.sleep(0.5)  # Simulate API latency
            logger.info(f"Email sent to {notification.recipient}")
        elif notification.type == "sms":
            # Mock SMS sending
            await asyncio.sleep(0.3)  # Simulate API latency
            logger.info(f"SMS sent to {notification.recipient}")
        
        # Update stats
        notification_stats.total_processed += 1
        
    except Exception as e:
        logger.error(f"Failed to send notification: {e}", exc_info=True)
        notification_stats.total_failed += 1

@app.post("/notify")
async def send_direct_notification(notification: NotificationRequest, background_tasks: BackgroundTasks):
    """API endpoint to directly send a notification"""
    await notification_queue.put(notification)
    notification_stats.queue_size = notification_queue.qsize()
    return {"status": "notification queued", "queue_size": notification_queue.qsize()}

@app.get("/status")
async def get_status():
    """Get notification service status"""
    notification_stats.queue_size = notification_queue.qsize()
    notification_stats.is_running = _running
    return notification_stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

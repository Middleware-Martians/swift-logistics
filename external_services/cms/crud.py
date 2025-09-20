from sqlalchemy.orm import Session
import models, schemas

def get_client_by_name(db: Session, name: str):
    return db.query(models.Client).filter(models.Client.name == name).first()

def get_client_by_id(db: Session, client_id: int):
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def get_client_by_credentials(db: Session, name: str, password: str):
    return db.query(models.Client).filter(
        models.Client.name == name, 
        models.Client.password == password
    ).first()

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(name=client.name, password=client.password)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def get_clients(db: Session):
    return db.query(models.Client).all()

def create_order(db: Session, order: schemas.OrderCreate):
    db_order = models.Order(
        client_id=order.client_id,
        weight=order.weight,
        location=order.location if order.location else None,
        status=schemas.Delivery_Status.ON_THE_WAY  # Always default to ON_THE_WAY
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session, client_id: int = None):
    query = db.query(models.Order)
    if client_id:
        query = query.filter(models.Order.client_id == client_id)
    return query.all()

def get_order_by_id(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def update_order_status(db: Session, order_id: int, status: schemas.Delivery_Status):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order:
        order.status = status
        db.commit()
        db.refresh(order)
    return order

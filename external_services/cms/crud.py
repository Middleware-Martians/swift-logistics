from sqlalchemy.orm import Session
import models, schemas

def get_client_by_name(db: Session, name: str):
    return db.query(models.Client).filter(models.Client.name == name).first()

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(name=client.name, password=client.password)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def get_clients(db: Session):
    return db.query(models.Client).all()

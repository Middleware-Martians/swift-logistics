from fastapi import FastAPI, Depends, HTTPException, Response
import xml.etree.ElementTree as ET
from enum import Enum
from sqlalchemy import create_engine, Column, Enum as SqlEnum, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally: 
        db.close()

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Delivery_Status(str, Enum):
    ON_THE_WAY = "On_The_Way"
    DELIVERED = "Delivered"
    RETURNED = "Returned"

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    password = Column(String)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, index=True)
    status = Column(SqlEnum(Delivery_Status), nullable=False)
    weight = Column(Integer)

Base.metadata.create_all(bind=engine)

class ClientCreate(BaseModel):
    name: str
    password: str

class ClientResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

@app.post("/clients/", response_model=ClientResponse)
def create_user(user: ClientCreate, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.name == user.name).first()
    if db_client:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_client = Client(name=user.name)
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

@app.get("/soap/clients/")
def soap_get_clients(db: Session = Depends(get_db)):
    clients = db.query(Client).all()

    envelope = ET.Element("soap:Envelope", {
        "xmlns:soap" : "http://schemas.xmlsoap.org/soap/envelope"
    })

    body = ET.SubElement(envelope, "soap:Body")
    clients_response = ET.SubElement(body, "ClientsResponse")

    for client in clients:
        client_elem = ET.SubElement(clients_response, "Client")
        ET.SubElement(client_elem, "id").text = str(client.id)
        ET.SubElement(client_elem, "name").text = str(client.name)

    xml_str = ET.tostring(envelope, encoding="utf-8", method="xml")
    return Response(content=xml_str, media_type="text/xml")

@app.get("/clients/", response_model=list[ClientResponse])
def get_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()

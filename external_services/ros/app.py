from fastapi import FastAPI, Depends, HTTPException
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

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, index=True)
    driver_id = Column(Integer, index=True)
    status = Column(SqlEnum(Delivery_Status), nullable=False)

Base.metadata.create_all(bind=engine)

class DriverCreate(BaseModel):
    name: str

class DriverResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

@app.post("/drivers/", response_model=DriverResponse)
def create_user(user: DriverCreate, db: Session = Depends(get_db)):
    db_driver = db.query(Driver).filter(Driver.name == user.name).first()
    if db_driver:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_driver = Driver(name=user.name)
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)
    return new_driver

@app.get("/drivers/", response_model=list[DriverResponse])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(Driver).all()

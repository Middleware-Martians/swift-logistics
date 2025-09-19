from sqlalchemy import Column, Integer, String, Enum as SqlEnum
from db_conf import Base
from enum import Enum

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

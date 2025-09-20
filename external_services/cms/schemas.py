from pydantic import BaseModel
from enum import Enum

class Delivery_Status(str, Enum):
    ON_THE_WAY = "On_The_Way"
    DELIVERED = "Delivered"
    RETURNED = "Returned"

class ClientCreate(BaseModel):
    name: str
    password: str

class ClientResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ClientLogin(BaseModel):
    name: str
    password: str

class OrderCreate(BaseModel):
    client_id: int
    weight: int
    location: str = ""
    status: Delivery_Status = Delivery_Status.ON_THE_WAY

class OrderResponse(BaseModel):
    id: int
    client_id: int
    status: Delivery_Status
    weight: int
    location: str = ""

    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    status: Delivery_Status

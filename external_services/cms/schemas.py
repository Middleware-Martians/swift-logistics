from pydantic import BaseModel

class ClientCreate(BaseModel):
    name: str
    password: str

class ClientResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

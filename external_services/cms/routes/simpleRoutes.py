from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas, db_conf

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=schemas.ClientResponse)
def create_user(client: schemas.ClientCreate, db: Session = Depends(db_conf.get_db)):
    db_client = crud.get_client_by_name(db, client.name)
    if db_client:
        raise HTTPException(status_code=400, detail="Username already exists")
    return crud.create_client(db, client)

@router.get("/", response_model=list[schemas.ClientResponse])
def read_clients(db: Session = Depends(db_conf.get_db)):
    return crud.get_clients(db)

@router.post("/login", response_model=schemas.ClientResponse)
def login_client(client_login: schemas.ClientLogin, db: Session = Depends(db_conf.get_db)):
    db_client = crud.get_client_by_credentials(db, client_login.name, client_login.password)
    if not db_client:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return db_client

# Order routes
order_router = APIRouter(prefix="/orders", tags=["Orders"])

@order_router.post("/", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(db_conf.get_db)):
    # Check if client exists
    client = crud.get_client_by_id(db, order.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db_order = crud.create_order(db, order)
    return db_order

@order_router.get("/", response_model=list[schemas.OrderResponse])
def get_orders(client_id: int = None, db: Session = Depends(db_conf.get_db)):
    return crud.get_orders(db, client_id)

@order_router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(db_conf.get_db)):
    db_order = crud.get_order_by_id(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@order_router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(db_conf.get_db)):
    db_order = crud.update_order_status(db, order_id, order_update.status)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

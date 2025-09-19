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

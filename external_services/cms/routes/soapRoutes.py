from fastapi import APIRouter, Depends, Response, Request, HTTPException
from sqlalchemy.orm import Session
import xml.etree.ElementTree as ET
import db_conf, crud, models, schemas

router = APIRouter(prefix="/soap", tags=["SOAP"])

@router.post("/clients")
async def soap_create_client(request: Request, db: Session = Depends(db_conf.get_db)):
    body_bytes = await request.body()
    try:
        root = ET.fromstring(body_bytes)
    except ET.ParseError:
        raise HTTPException(status_code=400, detail="Invalid XML")
    
    ns = {"soap" : "http://schemas.xmlsoap.org/soap/envelope"}
    body = root.find("soap:Body", ns)
    if body is None:
        raise HTTPException(status_code=400, detail="SOAP Body not found")
    
    client_req = body.find("CreateClientRequest")
    if client_req is None:
        raise HTTPException(status_code=400, detail="Invalid SOAP request")
    
    name = client_req.findtext("name")
    password = client_req.findtext("password")

    if not name or not password:
        raise HTTPException(status_code=400, detail="Missing client data")
    
    existing = crud.get_client_by_name(db, name)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_client = models.Client(name=name, password=password)
    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    enveloped = ET.Element("soap:Envelope", {
        "xmlns:soap" : "http://schemas.xmlsoap.org/soap/envelope"
    })
    body_resp = ET.SubElement(enveloped, "soap:Body")
    resp = ET.SubElement(body_resp, "CreateClientResponse")

    ET.SubElement(resp, "id").text = str(new_client.id)
    ET.SubElement(resp, "name").text = new_client.name

    xml_str = ET.tostring(enveloped, encoding="utf-8", method="xml")
    return Response(content=xml_str, media_type="text/xml")


@router.get("/clients")
def soap_get_clients(db: Session = Depends(db_conf.get_db)):
    clients = crud.get_clients(db)

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

@router.post("/clients/login")
async def soap_login_client(request: Request, db: Session = Depends(db_conf.get_db)):
    body_bytes = await request.body()
    try:
        root = ET.fromstring(body_bytes)
    except ET.ParseError:
        raise HTTPException(status_code=400, detail="Invalid XML")
    
    ns = {"soap": "http://schemas.xmlsoap.org/soap/envelope"}
    body = root.find("soap:Body", ns)
    if body is None:
        raise HTTPException(status_code=400, detail="SOAP Body not found")
    
    login_req = body.find("LoginRequest")
    if login_req is None:
        raise HTTPException(status_code=400, detail="Invalid SOAP request")
    
    name = login_req.findtext("name")
    password = login_req.findtext("password")

    if not name or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")
    
    client = crud.get_client_by_credentials(db, name, password)
    if not client:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    envelope = ET.Element("soap:Envelope", {
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope"
    })
    body_resp = ET.SubElement(envelope, "soap:Body")
    resp = ET.SubElement(body_resp, "LoginResponse")

    ET.SubElement(resp, "id").text = str(client.id)
    ET.SubElement(resp, "name").text = client.name
    ET.SubElement(resp, "message").text = "Login successful"

    xml_str = ET.tostring(envelope, encoding="utf-8", method="xml")
    return Response(content=xml_str, media_type="text/xml")

@router.post("/orders")
async def soap_create_order(request: Request, db: Session = Depends(db_conf.get_db)):
    body_bytes = await request.body()
    try:
        root = ET.fromstring(body_bytes)
    except ET.ParseError:
        raise HTTPException(status_code=400, detail="Invalid XML")
    
    ns = {"soap": "http://schemas.xmlsoap.org/soap/envelope"}
    body = root.find("soap:Body", ns)
    if body is None:
        raise HTTPException(status_code=400, detail="SOAP Body not found")
    
    order_req = body.find("CreateOrderRequest")
    if order_req is None:
        raise HTTPException(status_code=400, detail="Invalid SOAP request")
    
    client_id = order_req.findtext("client_id")
    weight = order_req.findtext("weight")
    location = order_req.findtext("location")

    if not client_id or not weight:
        raise HTTPException(status_code=400, detail="Missing order data")
    
    try:
        client_id = int(client_id)
        weight = int(weight)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid data types")

    # Always use default status ON_THE_WAY
    order_create = schemas.OrderCreate(client_id=client_id, weight=weight, location=location or "")
    new_order = crud.create_order(db, order_create)

    envelope = ET.Element("soap:Envelope", {
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope"
    })
    body_resp = ET.SubElement(envelope, "soap:Body")
    resp = ET.SubElement(body_resp, "CreateOrderResponse")

    ET.SubElement(resp, "id").text = str(new_order.id)
    ET.SubElement(resp, "client_id").text = str(new_order.client_id)
    ET.SubElement(resp, "weight").text = str(new_order.weight)
    ET.SubElement(resp, "status").text = new_order.status.value
    ET.SubElement(resp, "location").text = str(new_order.location or "")

    xml_str = ET.tostring(envelope, encoding="utf-8", method="xml")
    return Response(content=xml_str, media_type="text/xml")

@router.get("/orders")
def soap_get_orders(request: Request, db: Session = Depends(db_conf.get_db)):
    # You can pass client_id as a query parameter
    client_id = request.query_params.get("client_id")
    client_id = int(client_id) if client_id else None
    
    orders = crud.get_orders(db, client_id)

    envelope = ET.Element("soap:Envelope", {
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope"
    })

    body = ET.SubElement(envelope, "soap:Body")
    orders_response = ET.SubElement(body, "OrdersResponse")

    for order in orders:
        order_elem = ET.SubElement(orders_response, "Order")
        ET.SubElement(order_elem, "id").text = str(order.id)
        ET.SubElement(order_elem, "client_id").text = str(order.client_id)
        ET.SubElement(order_elem, "weight").text = str(order.weight)
        ET.SubElement(order_elem, "status").text = order.status.value
        ET.SubElement(order_elem, "location").text = str(order.location or "")

    xml_str = ET.tostring(envelope, encoding="utf-8", method="xml")
    return Response(content=xml_str, media_type="text/xml")

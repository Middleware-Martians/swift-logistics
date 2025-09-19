from fastapi import APIRouter, Depends, Response, Request, HTTPException
from sqlalchemy.orm import Session
import xml.etree.ElementTree as ET
import db_conf, crud, models

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

    ET.SubElement(resp, "id").text = new_client.id
    ET.SubElement(resp, "name").text = new_client.password

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

# Swift Logistics - API Endpoints Reference

This document provides a comprehensive list of all API endpoints available in the three external services that make up the Swift Logistics system.

## Table of Contents

- [CMS (Content Management System) - Port 8000](#cms-content-management-system---port-8000)
- [ROS (Route Optimization System) - Port 8001](#ros-route-optimization-system---port-8001)
- [WMS (Warehouse Management System) - Port 8002](#wms-warehouse-management-system---port-8002)

---

## CMS (Content Management System) - Port 8000

**Base URL**: `http://localhost:8000`

### Client Management Endpoints

#### 1. Create Client (REST)

- **Method**: `POST`
- **Endpoint**: `/clients/`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "name": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "id": "integer",
  "name": "string"
}
```

#### 2. Create Client (SOAP)

- **Method**: `POST`
- **Endpoint**: `/soap/clients`
- **Content-Type**: `text/xml`
- **Request Body**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <CreateClientRequest>
      <name>string</name>
      <password>string</password>
    </CreateClientRequest>
  </soap:Body>
</soap:Envelope>
```

- **Response**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <CreateClientResponse>
      <id>integer</id>
      <name>string</name>
    </CreateClientResponse>
  </soap:Body>
</soap:Envelope>
```

#### 3. Get All Clients (REST)

- **Method**: `GET`
- **Endpoint**: `/clients/`
- **Response**:

```json
[
  {
    "id": "integer",
    "name": "string"
  }
]
```

#### 4. Get All Clients (SOAP)

- **Method**: `GET`
- **Endpoint**: `/soap/clients`
- **Response**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <ClientsResponse>
      <Client>
        <id>integer</id>
        <name>string</name>
      </Client>
      <!-- Multiple Client elements -->
    </ClientsResponse>
  </soap:Body>
</soap:Envelope>
```

#### 5. Client Login (REST)

- **Method**: `POST`
- **Endpoint**: `/clients/login`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "name": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "id": "integer",
  "name": "string"
}
```

#### 6. Client Login (SOAP)

- **Method**: `POST`
- **Endpoint**: `/soap/clients/login`
- **Content-Type**: `text/xml`
- **Request Body**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <LoginRequest>
      <name>string</name>
      <password>string</password>
    </LoginRequest>
  </soap:Body>
</soap:Envelope>
```

- **Response**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <LoginResponse>
      <id>integer</id>
      <name>string</name>
      <message>Login successful</message>
    </LoginResponse>
  </soap:Body>
</soap:Envelope>
```

### Order Management Endpoints

#### 7. Create Order (REST)

- **Method**: `POST`
- **Endpoint**: `/orders/`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "client_id": "integer",
  "weight": "integer",
  "location": "string"
}
```

- **Response**:

```json
{
  "id": "integer",
  "client_id": "integer",
  "status": "On_The_Way|Delivered|Returned",
  "weight": "integer",
  "location": "string"
}
```

#### 8. Create Order (SOAP)

- **Method**: `POST`
- **Endpoint**: `/soap/orders`
- **Content-Type**: `text/xml`
- **Request Body**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <CreateOrderRequest>
      <client_id>integer</client_id>
      <weight>integer</weight>
      <location>string</location>
    </CreateOrderRequest>
  </soap:Body>
</soap:Envelope>
```

- **Response**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <CreateOrderResponse>
      <id>integer</id>
      <client_id>integer</client_id>
      <weight>integer</weight>
      <status>On_The_Way</status>
      <location>string</location>
    </CreateOrderResponse>
  </soap:Body>
</soap:Envelope>
```

#### 9. Get Orders (REST)

- **Method**: `GET`
- **Endpoint**: `/orders/?client_id={client_id}` (client_id is optional)
- **Query Parameters**:
  - `client_id` (optional): Filter orders by client ID
- **Response**:

```json
[
  {
    "id": "integer",
    "client_id": "integer",
    "status": "On_The_Way|Delivered|Returned",
    "weight": "integer",
    "location": "string"
  }
]
```

#### 10. Get Orders (SOAP)

- **Method**: `GET`
- **Endpoint**: `/soap/orders?client_id={client_id}` (client_id is optional)
- **Query Parameters**:
  - `client_id` (optional): Filter orders by client ID
- **Response**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <OrdersResponse>
      <Order>
        <id>integer</id>
        <client_id>integer</client_id>
        <weight>integer</weight>
        <status>On_The_Way</status>
        <location>string</location>
      </Order>
      <!-- Multiple Order elements -->
    </OrdersResponse>
  </soap:Body>
</soap:Envelope>
```

#### 11. Get Single Order (REST)

- **Method**: `GET`
- **Endpoint**: `/orders/{order_id}`
- **Path Parameters**:
  - `order_id`: The ID of the order to retrieve
- **Response**:

```json
{
  "id": "integer",
  "client_id": "integer",
  "status": "On_The_Way|Delivered|Returned",
  "weight": "integer",
  "location": "string"
}
```

#### 12. Update Order Status (REST)

- **Method**: `PUT`
- **Endpoint**: `/orders/{order_id}/status`
- **Path Parameters**:
  - `order_id`: The ID of the order to update
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "status": "On_The_Way|Delivered|Returned"
}
```

- **Response**:

```json
{
  "id": "integer",
  "client_id": "integer",
  "status": "On_The_Way|Delivered|Returned",
  "weight": "integer",
  "location": "string"
}
```

---

## ROS (Route Optimization System) - Port 8001

**Base URL**: `http://localhost:8001`

### Location Management Endpoints

#### 1. Update Location

- **Method**: `POST`
- **Endpoint**: `/location/update/`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float"
}
```

- **Response**:

```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float",
  "timestamp": "string (ISO format)"
}
```

#### 2. Get Location

- **Method**: `GET`
- **Endpoint**: `/location/{order_id}`
- **Path Parameters**:
  - `order_id`: The ID of the order to get location for
- **Response**:

```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float",
  "timestamp": "string (ISO format)"
}
```

---

## WMS (Warehouse Management System) - Port 8002

**Base URL**: `http://localhost:8002`

### Delivery Management Endpoints

#### 1. Create Delivery

- **Method**: `POST`
- **Endpoint**: `/deliveries/`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "order_id": "string",
  "address": "string"
}
```

- **Response**:

```json
{
  "order_id": "string",
  "delivery_status": "on the way",
  "address": "string",
  "driver_id": "string"
}
```

- **Side Effects**:
  - Sends TCP message to 127.0.0.1:9000
  - Message Format: `"New delivery assigned: order_id={order_id}, driver={driver_id}"`

#### 2. Get Delivery

- **Method**: `GET`
- **Endpoint**: `/deliveries/{order_id}`
- **Path Parameters**:
  - `order_id`: The ID of the order to get delivery info for
- **Response**:

```json
{
  "order_id": "string",
  "delivery_status": "string",
  "address": "string",
  "driver_id": "string"
}
```

### Driver Management Endpoints

#### 3. Create Driver

- **Method**: `POST`
- **Endpoint**: `/drivers/`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "driver_id": "string",
  "name": "string"
}
```

- **Response**:

```json
{
  "driver_id": "string",
  "name": "string",
  "available": true
}
```

#### 4. List All Drivers

- **Method**: `GET`
- **Endpoint**: `/drivers/`
- **Response**:

```json
[
  {
    "driver_id": "string",
    "name": "string",
    "available": "boolean"
  }
]
```

#### 5. Get Driver by ID

- **Method**: `GET`
- **Endpoint**: `/drivers/{driver_id}`
- **Path Parameters**:
  - `driver_id`: The ID of the driver to retrieve
- **Response**:

```json
{
  "driver_id": "string",
  "name": "string",
  "available": "boolean"
}
```

#### 6. Get Available Driver

- **Method**: `GET`
- **Endpoint**: `/drivers/available`
- **Response**:

```json
{
  "driver_id": "string",
  "name": "string",
  "available": true
}
```

---

## Error Responses

### Common Error Scenarios

#### 400 Bad Request - No Available Drivers (WMS)

```json
{
  "detail": "No available drivers"
}
```

#### 401 Unauthorized - Invalid Credentials (CMS)

```json
{
  "detail": "Invalid credentials"
}
```

#### 404 Not Found - Order Not Found (CMS)

```json
{
  "detail": "Order not found"
}
```

---

## TCP/IP Communication

### TCP Server Details

- **Host**: 127.0.0.1
- **Port**: 9000
- **Protocol**: Plain text messages over TCP
- **Message Format**: `"New delivery assigned: order_id={order_id}, driver={driver_id}"`
- **Trigger**: Automatically sent when a delivery is created in WMS

---

## Status Values

### Order Status (CMS)

- `On_The_Way`: Order is being delivered
- `Delivered`: Order has been successfully delivered
- `Returned`: Order was returned to sender

### Delivery Status (WMS)

- `on the way`: Delivery is in progress
- Additional statuses may be available based on business logic

---

## Notes

1. All services support CORS for web client integration
2. All services use SQLite as their database backend
3. CMS supports both REST (JSON) and SOAP (XML) protocols
4. ROS and WMS only support REST (JSON) protocol
5. WMS has additional TCP/IP communication for external system notifications
6. All timestamps are in ISO format
7. Boolean values in responses are returned as `true`/`false`

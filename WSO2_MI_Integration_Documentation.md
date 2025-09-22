# Swift Logistics - WSO2 Micro Integrator API Integration Documentation

## System Overview

Swift Logistics consists of three external services that need to be orchestrated through WSO2 Micro Integrator (WSO2 MI):

1. **CMS (Content Management System)** - Order and Client Management (Port: 8000)
2. **ROS (Route Optimization System)** - Location Tracking (Port: 8001)
3. **WMS (Warehouse Management System)** - Delivery and Driver Management (Port: 8002)

## Service Communication Protocols

- **CMS**: HTTP/JSON (REST) + SOAP/XML
- **ROS**: HTTP/JSON (REST)
- **WMS**: HTTP/JSON (REST) + TCP/IP protocol
- **WSO2 MI Interface**: All requests/responses standardized to JSON

---

## 1. CMS (Content Management System) API Endpoints

### Base URL: `http://localhost:8000`

### 1.1 Client Management

#### 1.1.1 Create Client (REST)

- **Endpoint**: `POST /clients/`
- **WSO2 MI Input** (JSON):

```json
{
  "name": "string",
  "password": "string"
}
```

- **WSO2 MI Output** (JSON):

```json
{
  "id": "integer",
  "name": "string"
}
```

#### 1.1.2 Create Client (SOAP)

- **Endpoint**: `POST /soap/clients`
- **WSO2 MI Input** (JSON):

```json
{
  "name": "string",
  "password": "string"
}
```

- **Internal SOAP Transformation** (WSO2 MI converts JSON to XML):

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

- **Internal SOAP Response** (CMS returns XML):

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

- **WSO2 MI Output** (JSON):

```json
{
  "id": "integer",
  "name": "string"
}
```

#### 1.1.3 Get All Clients (REST)

- **Endpoint**: `GET /clients/`
- **WSO2 MI Input**: No body
- **WSO2 MI Output** (JSON):

```json
[
  {
    "id": "integer",
    "name": "string"
  }
]
```

#### 1.1.4 Get All Clients (SOAP)

- **Endpoint**: `GET /soap/clients`
- **WSO2 MI Input**: No body
- **Internal SOAP Response** (CMS returns XML):

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

- **WSO2 MI Output** (JSON):

```json
[
  {
    "id": "integer",
    "name": "string"
  }
]
```

#### 1.1.5 Client Login (REST)

- **Endpoint**: `POST /clients/login`
- **WSO2 MI Input** (JSON):

```json
{
  "name": "string",
  "password": "string"
}
```

- **WSO2 MI Output** (JSON):

```json
{
  "id": "integer",
  "name": "string"
}
```

#### 1.1.6 Client Login (SOAP)

- **Endpoint**: `POST /soap/clients/login`
- **WSO2 MI Input** (JSON):

```json
{
  "name": "string",
  "password": "string"
}
```

- **Internal SOAP Transformation** (WSO2 MI converts JSON to XML):

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

- **Internal SOAP Response** (CMS returns XML):

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

- **WSO2 MI Output** (JSON):

```json
{
  "id": "integer",
  "name": "string",
  "message": "Login successful"
}
```

### 1.2 Order Management

#### 1.2.1 Create Order (REST)

- **Endpoint**: `POST /orders/`
- **WSO2 MI Input** (JSON):

```json
{
  "client_id": "integer",
  "weight": "integer",
  "location": "string"
}
```

- **WSO2 MI Output** (JSON):

```json
{
  "id": "integer",
  "client_id": "integer",
  "status": "On_The_Way|Delivered|Returned",
  "weight": "integer",
  "location": "string"
}
```

#### 1.2.2 Create Order (SOAP)

- **Endpoint**: `POST /soap/orders`
- **WSO2 MI Input** (JSON):

```json
{
  "client_id": "integer",
  "weight": "integer",
  "location": "string"
}
```

- **Internal SOAP Transformation** (WSO2 MI converts JSON to XML):

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

- **Internal SOAP Response** (CMS returns XML):

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

- **WSO2 MI Output** (JSON):

```json
{
  "id": "integer",
  "client_id": "integer",
  "status": "On_The_Way",
  "weight": "integer",
  "location": "string"
}
```

#### 1.2.3 Get Orders (REST)

- **Endpoint**: `GET /orders/?client_id={client_id}` (optional client_id filter)
- **WSO2 MI Input**: Query parameter client_id (optional)
- **WSO2 MI Output** (JSON):

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

#### 1.2.4 Get Orders (SOAP)

- **Endpoint**: `GET /soap/orders?client_id={client_id}` (optional client_id filter)
- **WSO2 MI Input**: Query parameter client_id (optional)
- **Internal SOAP Response** (CMS returns XML):

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

- **WSO2 MI Output** (JSON):

```json
[
  {
    "id": "integer",
    "client_id": "integer",
    "status": "On_The_Way",
    "weight": "integer",
    "location": "string"
  }
]
```

#### 1.2.5 Get Single Order (REST)

- **Endpoint**: `GET /orders/{order_id}`
- **WSO2 MI Input**: Path parameter order_id
- **WSO2 MI Output** (JSON):

```json
{
  "id": "integer",
  "client_id": "integer",
  "status": "On_The_Way|Delivered|Returned",
  "weight": "integer",
  "location": "string"
}
```

#### 1.2.6 Update Order Status (REST)

- **Endpoint**: `PUT /orders/{order_id}/status`
- **WSO2 MI Input** (JSON):

```json
{
  "status": "On_The_Way|Delivered|Returned"
}
```

- **WSO2 MI Output** (JSON):

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

## 2. ROS (Route Optimization System) API Endpoints

### Base URL: `http://localhost:8001`

#### 2.1 Update Location

- **Endpoint**: `POST /location/update/`
- **WSO2 MI Input** (JSON):

```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float"
}
```

- **WSO2 MI Output** (JSON):

```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float",
  "timestamp": "string (ISO format)"
}
```

#### 2.2 Get Location

- **Endpoint**: `GET /location/{order_id}`
- **WSO2 MI Input**: Path parameter order_id
- **WSO2 MI Output** (JSON):

```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float",
  "timestamp": "string (ISO format)"
}
```

---

## 3. WMS (Warehouse Management System) API Endpoints

### Base URL: `http://localhost:8002`

### 3.1 Delivery Management

#### 3.1.1 Create Delivery

- **Endpoint**: `POST /deliveries/`
- **WSO2 MI Input** (JSON):

```json
{
  "order_id": "string",
  "address": "string"
}
```

- **WSO2 MI Output** (JSON):

```json
{
  "order_id": "string",
  "delivery_status": "on the way",
  "address": "string",
  "driver_id": "string"
}
```

- **TCP/IP Side Effect**: Sends message to TCP server (127.0.0.1:9000)
  - Message Format: `"New delivery assigned: order_id={order_id}, driver={driver_id}"`

#### 3.1.2 Get Delivery

- **Endpoint**: `GET /deliveries/{order_id}`
- **WSO2 MI Input**: Path parameter order_id
- **WSO2 MI Output** (JSON):

```json
{
  "order_id": "string",
  "delivery_status": "string",
  "address": "string",
  "driver_id": "string"
}
```

### 3.2 Driver Management

#### 3.2.1 Create Driver

- **Endpoint**: `POST /drivers/`
- **WSO2 MI Input** (JSON):

```json
{
  "driver_id": "string",
  "name": "string"
}
```

- **WSO2 MI Output** (JSON):

```json
{
  "driver_id": "string",
  "name": "string",
  "available": true
}
```

#### 3.2.2 List All Drivers

- **Endpoint**: `GET /drivers/`
- **WSO2 MI Input**: No body
- **WSO2 MI Output** (JSON):

```json
[
  {
    "driver_id": "string",
    "name": "string",
    "available": "boolean"
  }
]
```

#### 3.2.3 Get Driver by ID

- **Endpoint**: `GET /drivers/{driver_id}`
- **WSO2 MI Input**: Path parameter driver_id
- **WSO2 MI Output** (JSON):

```json
{
  "driver_id": "string",
  "name": "string",
  "available": "boolean"
}
```

#### 3.2.4 Get Available Driver

- **Endpoint**: `GET /drivers/available`
- **WSO2 MI Input**: No body
- **WSO2 MI Output** (JSON):

```json
{
  "driver_id": "string",
  "name": "string",
  "available": true
}
```

### 3.3 TCP/IP Protocol Communication

**TCP Server Details:**

- **Host**: 127.0.0.1
- **Port**: 9000
- **Protocol**: Plain text messages over TCP

**Message Format:**

- When delivery is created: `"New delivery assigned: order_id={order_id}, driver={driver_id}"`
- No structured response expected from TCP server

---

## 4. System Orchestration Flows

### 4.1 Complete Order Processing Flow

```
1. Order Creation in CMS
   ↓
2. Delivery Creation in WMS (with Driver Assignment)
   ↓
3. TCP/IP Notification to External System
   ↓
4. Location Tracking in ROS
   ↓
5. Order Status Updates in CMS
```

#### 4.1.1 Flow 1: New Order Creation and Processing

**Step 1: Create Order in CMS**

- **WSO2 MI Endpoint**: `POST /cms/orders`
- **Input**:

```json
{
  "client_id": 1,
  "weight": 25,
  "location": "123 Main Street, City"
}
```

- **CMS Response**:

```json
{
  "id": 123,
  "client_id": 1,
  "status": "On_The_Way",
  "weight": 25,
  "location": "123 Main Street, City"
}
```

**Step 2: Create Delivery in WMS (Auto-triggered by WSO2 MI)**

- **WSO2 MI Endpoint**: `POST /wms/deliveries`
- **Input**:

```json
{
  "order_id": "123",
  "address": "123 Main Street, City"
}
```

- **WMS Response**:

```json
{
  "order_id": "123",
  "delivery_status": "on the way",
  "address": "123 Main Street, City",
  "driver_id": "DRIVER001"
}
```

- **TCP Side Effect**: Message sent to 127.0.0.1:9000: `"New delivery assigned: order_id=123, driver=DRIVER001"`

#### 4.1.2 Flow 2: Location Tracking

**Update Delivery Location**

- **WSO2 MI Endpoint**: `POST /ros/location/update`
- **Input**:

```json
{
  "order_id": "123",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

- **ROS Response**:

```json
{
  "order_id": "123",
  "latitude": 40.7128,
  "longitude": -74.006,
  "timestamp": "2025-09-20T10:30:00Z"
}
```

#### 4.1.3 Flow 3: Order Status Update

**Update Order Status in CMS**

- **WSO2 MI Endpoint**: `PUT /cms/orders/123/status`
- **Input**:

```json
{
  "status": "Delivered"
}
```

- **CMS Response**:

```json
{
  "id": 123,
  "client_id": 1,
  "status": "Delivered",
  "weight": 25,
  "location": "123 Main Street, City"
}
```

### 4.2 Error Handling Scenarios

#### 4.2.1 No Available Drivers

- **WMS Response**: HTTP 400

```json
{
  "detail": "No available drivers"
}
```

#### 4.2.2 Order Not Found

- **CMS Response**: HTTP 404

```json
{
  "detail": "Order not found"
}
```

#### 4.2.3 Invalid Credentials

- **CMS Response**: HTTP 401

```json
{
  "detail": "Invalid credentials"
}
```

---

## 5. WSO2 Micro Integrator Requirements

### 5.1 Data Transformations Required

1. **JSON to SOAP XML** (for CMS SOAP endpoints)
2. **SOAP XML to JSON** (for CMS SOAP responses)
3. **HTTP to TCP/IP protocol** (for WMS notifications)
4. **Error response normalization** (standardize all error formats)

### 5.2 Mediation Sequences

#### 5.2.1 Order Creation Mediation

```
Client Request (JSON)
→ CMS Order Creation
→ WMS Delivery Creation (parallel)
→ TCP Notification
→ Aggregated Response to Client
```

#### 5.2.2 SOAP to JSON Mediation

```
JSON Request
→ JSON to SOAP XML transformation
→ CMS SOAP Endpoint Call
→ SOAP XML to JSON transformation
→ JSON Response
```

### 5.3 Service Ports

- **CMS**: 8000
- **ROS**: 8001
- **WMS**: 8002
- **TCP Server**: 127.0.0.1:9000

### 5.4 Content Types

- **Input to WSO2 MI**: application/json
- **Output from WSO2 MI**: application/json
- **CMS SOAP**: text/xml
- **TCP Protocol**: text/plain

---

## 6. Implementation Notes for WSO2 MI AI Chat

When configuring WSO2 MI, ensure:

1. **Message Formatters**: Configure JSON and XML message formatters
2. **Property Mediators**: Extract and set required headers and properties
3. **PayloadFactory Mediators**: For JSON to SOAP transformations
4. **Aggregate Mediator**: For combining responses from multiple services
5. **Call Mediator**: For making HTTP calls to external services
6. **Log Mediator**: For debugging and monitoring
7. **Filter Mediator**: For conditional logic and error handling
8. **TCP Transport**: Configure for WMS TCP notifications

### 6.1 Key Configuration Points

- All external services run on localhost
- Standard HTTP error codes are returned
- SOAP envelope namespace: `http://schemas.xmlsoap.org/soap/envelope`
- TCP connection is persistent and daemon-threaded
- Database backends use SQLite
- CORS is enabled for web client integration

This documentation provides the complete API structure needed to configure WSO2 Micro Integrator for orchestrating the three external services with standardized JSON input/output interfaces.

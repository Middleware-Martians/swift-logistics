# Swift Logistics API Documentation

This document provides a comprehensive overview of all available endpoints across the three microservices that comprise the Swift Logistics system.

## Service Endpoints

| Service | Description | Base URL |
|---------|-------------|----------|
| CMS (Customer Management System) | Handles client data and orders | http://localhost:8001 |
| WMS (Warehouse Management System) | Manages warehouses, deliveries, and drivers | http://localhost:8002 |
| ROS (Route Optimization System) | Tracks delivery locations and optimizes routes | http://localhost:8003 |

## 1. CMS (Customer Management System) - Port 8001

The CMS service provides both REST and SOAP interfaces for managing clients and orders.

### 1.1 REST API Endpoints

#### Client Endpoints

| Method | Endpoint | Description | Request Body | Response Type |
|--------|----------|-------------|--------------|---------------|
| POST | `/clients/` | Create a new client | `ClientCreate` | `ClientResponse` |
| GET | `/clients/` | List all clients | None | List of `ClientResponse` |
| POST | `/clients/login` | Client login | `ClientLogin` | `ClientResponse` |

**ClientCreate Schema:**
```json
{
  "name": "string",
  "password": "string"
}
```

**ClientResponse Schema:**
```json
{
  "id": "integer",
  "name": "string"
}
```

**ClientLogin Schema:**
```json
{
  "name": "string",
  "password": "string"
}
```

#### Order Endpoints

| Method | Endpoint | Description | Request Body | Response Type |
|--------|----------|-------------|--------------|---------------|
| POST | `/orders/` | Create a new order | `OrderCreate` | `OrderResponse` |
| GET | `/orders/` | List all orders (optional client_id query param) | None | List of `OrderResponse` |
| GET | `/orders/{order_id}` | Get a specific order | None | `OrderResponse` |
| PUT | `/orders/{order_id}/status` | Update order status | `OrderUpdate` | `OrderResponse` |

**OrderCreate Schema:**
```json
{
  "client_id": "integer",
  "weight": "integer",
  "location": "string",
  "status": "string (On_The_Way, Delivered, Returned)"
}
```

**OrderResponse Schema:**
```json
{
  "id": "integer",
  "client_id": "integer",
  "status": "string (On_The_Way, Delivered, Returned)",
  "weight": "integer",
  "location": "string"
}
```

**OrderUpdate Schema:**
```json
{
  "status": "string (On_The_Way, Delivered, Returned)"
}
```

### 1.2 SOAP API Endpoints

| Method | Endpoint | Description | Request XML | Response XML |
|--------|----------|-------------|-------------|--------------|
| POST | `/soap/clients` | Create a client | SOAP XML with CreateClientRequest | SOAP XML with CreateClientResponse |
| GET | `/soap/clients` | List all clients | None | SOAP XML with ClientsResponse |
| POST | `/soap/clients/login` | Client login | SOAP XML with LoginRequest | SOAP XML with LoginResponse |

**Example SOAP Create Client Request:**
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope">
  <soap:Body>
    <CreateClientRequest>
      <name>string</name>
      <password>string</password>
    </CreateClientRequest>
  </soap:Body>
</soap:Envelope>
```

## 2. WMS (Warehouse Management System) - Port 8002

The WMS service manages warehouse operations, deliveries, and drivers.

### 2.1 Delivery Endpoints

| Method | Endpoint | Description | Request Body | Response Type |
|--------|----------|-------------|--------------|---------------|
| POST | `/deliveries/` | Create a new delivery | `DeliveryRequest` | `DeliveryResponse` |
| GET | `/deliveries/{order_id}` | Get delivery details | None | `DeliveryResponse` |

**DeliveryRequest Schema:**
```json
{
  "order_id": "string",
  "address": "string"
}
```

**DeliveryResponse Schema:**
```json
{
  "order_id": "string",
  "delivery_status": "string",
  "address": "string",
  "driver_id": "string"
}
```

### 2.2 Driver Endpoints

| Method | Endpoint | Description | Request Body | Response Type |
|--------|----------|-------------|--------------|---------------|
| POST | `/drivers/` | Create a new driver | `DriverCreate` | `DriverResponse` |
| GET | `/drivers/` | List all drivers | None | List of `DriverResponse` |
| GET | `/drivers/{driver_id}` | Get a specific driver | None | `DriverResponse` |
| GET | `/drivers/available` | Get an available driver | None | `DriverResponse` |

**DriverCreate Schema:**
```json
{
  "driver_id": "string",
  "name": "string"
}
```

**DriverResponse Schema:**
```json
{
  "driver_id": "string",
  "name": "string",
  "available": "boolean"
}
```

## 3. ROS (Route Optimization System) - Port 8003

The ROS service tracks delivery locations and provides route optimization.

### 3.1 Location Endpoints

| Method | Endpoint | Description | Request Body | Response Type |
|--------|----------|-------------|--------------|---------------|
| POST | `/location/update/` | Update delivery location | `LocationUpdate` | `LocationResponse` |
| GET | `/location/{order_id}` | Get latest location for an order | None | `LocationResponse` |

**LocationUpdate Schema:**
```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float"
}
```

**LocationResponse Schema:**
```json
{
  "order_id": "string",
  "latitude": "float",
  "longitude": "float",
  "timestamp": "string (ISO format)"
}
```

## 4. Additional TCP Server - Port 9000

A TCP server runs on port 9000 to handle low-level protocol communications between services.

## API Documentation

Each service provides its own Swagger UI documentation at:

- CMS Swagger UI: http://localhost:8001/docs
- WMS Swagger UI: http://localhost:8002/docs  
- ROS Swagger UI: http://localhost:8003/docs

You can use these interactive documentation pages to explore and test the APIs directly.
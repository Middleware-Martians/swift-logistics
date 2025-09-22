# Driver Signup API Documentation

## Overview
The driver signup functionality allows new drivers to register with the Swift Logistics system. This feature has been implemented in both the WMS (Warehouse Management System) and is accessible through the middleware API.

## Endpoints

### 1. Direct WMS Endpoint
**POST** `/drivers/signup`
- **URL**: `http://localhost:8002/drivers/signup`
- **Purpose**: Direct registration with WMS

### 2. Middleware Proxy Endpoint  
**POST** `/api/wms/drivers/signup`
- **URL**: `http://localhost:3001/api/wms/drivers/signup`
- **Purpose**: Registration through middleware (recommended for frontend)

## Request Format

### Required Fields
```json
{
  "name": "string",           // Driver's full name
  "email": "string",          // Unique email address
  "phone": "string",          // Contact phone number
  "license_number": "string"  // Driver's license number
}
```

### Example Request
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "phone": "+1234567890",
  "license_number": "DL123456789"
}
```

## Response Format

### Success Response (200 OK)
```json
{
  "driver_id": "DRV12345678",      // Auto-generated unique ID
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890", 
  "license_number": "DL123456789",
  "available": true                 // Default availability status
}
```

### Error Responses

#### Email Already Exists (400 Bad Request)
```json
{
  "detail": "Email already registered"
}
```

#### Registration Failed (400 Bad Request)
```json
{
  "detail": "Driver registration failed"
}
```

## Database Schema

The driver information is stored in the `drivers` table with the following schema:

```sql
CREATE TABLE drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT UNIQUE,              -- Auto-generated (DRV + 8 chars)
    name TEXT,                          -- Driver's full name
    email TEXT UNIQUE,                  -- Unique email address
    phone TEXT,                         -- Contact phone
    license_number TEXT,                -- Driver's license number
    available INTEGER DEFAULT 1,       -- Availability (1=available, 0=busy)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### Using curl (Direct WMS)
```bash
curl -X POST http://localhost:8002/drivers/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "license_number": "DL987654321"
  }'
```

### Using curl (Middleware)
```bash
curl -X POST http://localhost:3001/api/wms/drivers/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith", 
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "license_number": "DL987654321"
  }'
```

### Using JavaScript (Frontend)
```javascript
const signupDriver = async (driverData) => {
  try {
    const response = await fetch('/api/wms/drivers/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driverData)
    });
    
    if (response.ok) {
      const driver = await response.json();
      console.log('Driver registered:', driver);
      return driver;
    } else {
      const error = await response.json();
      console.error('Registration failed:', error.detail);
      throw new Error(error.detail);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Usage
signupDriver({
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890", 
  license_number: "DL123456789"
});
```

## Integration Notes

1. **Driver ID Generation**: The system auto-generates unique driver IDs in the format `DRV` + 8 uppercase hex characters
2. **Email Uniqueness**: Each driver must have a unique email address
3. **Default Availability**: New drivers are set as available by default
4. **Middleware Logging**: All requests through middleware are logged for monitoring
5. **Error Handling**: Both endpoints provide clear error messages for debugging

## Testing

Run the test script to verify functionality:
```bash
python test_driver_signup.py
```

The test script will verify:
- Direct WMS endpoint functionality
- Middleware proxy functionality  
- Driver retrieval endpoints
- Error handling for duplicate emails

## Related Endpoints

- `GET /drivers/` - List all drivers
- `GET /drivers/{driver_id}` - Get specific driver
- `GET /drivers/available` - Get next available driver
- `POST /drivers/` - Create driver (admin endpoint)
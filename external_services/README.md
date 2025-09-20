# Swift Logistics Services Management

This folder contains scripts to manage all Swift Logistics external services.

## Services Overview

| Service        | Port | Description                 | API Docs                   |
| -------------- | ---- | --------------------------- | -------------------------- |
| **CMS**        | 8001 | Customer Management System  | http://localhost:8001/docs |
| **WMS**        | 8002 | Warehouse Management System | http://localhost:8002/docs |
| **ROS**        | 8003 | Route Optimization System   | http://localhost:8003/docs |
| **TCP Server** | 9000 | Simple TCP Server           | 127.0.0.1:9000             |

## Quick Start

### Windows

```bash
# Start all services
start_all_services.bat

# Stop all services
stop_all_services.bat
```

### Linux/Mac

```bash
# Make scripts executable (first time only)
chmod +x *.sh

# Start all services
./start_all_services.sh

# Stop all services
./stop_all_services.sh
```

## Manual Service Management

### Individual Service Commands

**CMS Service (Port 8001):**

```bash
cd cms
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8001
```

**WMS Service (Port 8002):**

```bash
cd wms
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8002
```

**ROS Service (Port 8003):**

```bash
cd ros
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8003
```

**TCP Server (Port 9000):**

```bash
cd wms
python simple_tcp_server.py
```

## Service Dependencies

Make sure you have the required Python packages installed:

```bash
pip install fastapi uvicorn sqlalchemy sqlite3 pydantic
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

1. **Windows:**

   ```bash
   # Find process using port (e.g., 8001)
   netstat -ano | findstr :8001

   # Kill process by PID
   taskkill /PID <PID> /F
   ```

2. **Linux/Mac:**
   ```bash
   # Find and kill process using port
   lsof -ti:8001 | xargs kill -9
   ```

### Services Not Starting

1. Check if Python is in your PATH
2. Verify all required packages are installed
3. Check database permissions in each service folder
4. Ensure no firewall blocking the ports

## Service Architecture

```
Swift Logistics External Services
├── CMS (Customer Management) - Port 8001
│   ├── Customer CRUD operations
│   ├── SOAP/REST endpoints
│   └── Database: SQLite
├── WMS (Warehouse Management) - Port 8002
│   ├── Delivery management
│   ├── Driver assignment
│   └── Database: SQLite
├── ROS (Route Optimization) - Port 8003
│   ├── Location tracking
│   ├── Route calculations
│   └── Database: SQLite
└── TCP Server - Port 9000
    └── Simple TCP socket server
```

## Development Notes

- All services use FastAPI with auto-reload enabled
- SQLite databases are created automatically on first run
- Services are configured for CORS to work with frontend
- TCP server is a simple echo server for testing

## Environment Variables

You can override default ports by setting environment variables:

```bash
export CMS_PORT=8001
export WMS_PORT=8002
export ROS_PORT=8003
export TCP_PORT=9000
```

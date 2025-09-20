#!/bin/bash

# Swift Logistics System Startup Script
echo "🚚 Starting Swift Logistics System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -i :$1 > /dev/null 2>&1; then
        echo -e "${YELLOW}Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to start service in background
start_service() {
    local service_name=$1
    local port=$2
    local command=$3
    local directory=$4
    
    echo -e "${BLUE}Starting $service_name on port $port...${NC}"
    
    if check_port $port; then
        if [ -n "$directory" ]; then
            cd "$directory"
        fi
        $command &
        echo -e "${GREEN}✓ $service_name started on port $port${NC}"
    else
        echo -e "${RED}✗ Cannot start $service_name - port $port is in use${NC}"
    fi
}

# Start external services
echo -e "${BLUE}📦 Starting External Services...${NC}"

start_service "CMS Service" 8000 "python external_services/cms/app.py" ""
sleep 2

start_service "ROS Service" 8001 "python external_services/ros/app.py" ""
sleep 2  

start_service "WMS Service" 8002 "python external_services/wms/app.py" ""
sleep 2

# Start middleware API
echo -e "${BLUE}🔗 Starting Middleware API...${NC}"
start_service "Middleware API" 3001 "node middleware-api.js" ""
sleep 3

# Start React frontend
echo -e "${BLUE}🌐 Starting React Frontend...${NC}"
start_service "React Frontend" 3000 "npm start" "frontend"

echo ""
echo -e "${GREEN}🎉 Swift Logistics System Started Successfully!${NC}"
echo ""
echo -e "${YELLOW}📍 Access Points:${NC}"
echo -e "  🌐 React Dashboard: http://localhost:3000"
echo -e "  🔗 Middleware API: http://localhost:3001"
echo -e "  📊 CMS Service: http://localhost:8000"
echo -e "  🗺️  ROS Service: http://localhost:8001" 
echo -e "  📦 WMS Service: http://localhost:8002"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Use the Client Portal to create accounts and orders"
echo -e "  • Use the Driver App to manage deliveries"
echo -e "  • Watch the System Tracker for real-time activity"
echo -e "  • Check Request/Response viewers for API data"
echo ""
echo -e "${RED}🛑 To stop all services, press Ctrl+C${NC}"

# Wait for user input to keep script running
wait
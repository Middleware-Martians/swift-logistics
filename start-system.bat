@echo off
REM Swift Logistics System Startup Script for Windows

echo 🚚 Starting Swift Logistics System...

REM Start external services in background
echo 📦 Starting External Services...

echo Starting CMS Service on port 8000...
start "CMS Service" /min cmd /c "cd /d external_services\cms && python app.py"
timeout /t 3 /nobreak >nul

echo Starting ROS Service on port 8001...
start "ROS Service" /min cmd /c "cd /d external_services\ros && python app.py"
timeout /t 3 /nobreak >nul

echo Starting WMS Service on port 8002...  
start "WMS Service" /min cmd /c "cd /d external_services\wms && python app.py"
timeout /t 3 /nobreak >nul

REM Start middleware API
echo 🔗 Starting Middleware API on port 3001...
start "Middleware API" /min cmd /c "node middleware-api.js"
timeout /t 5 /nobreak >nul

REM Start React frontend
echo 🌐 Starting React Frontend on port 3000...
start "React Frontend" cmd /c "cd /d frontend && npm start"
timeout /t 3 /nobreak >nul

echo.
echo 🎉 Swift Logistics System Started Successfully!
echo.
echo 📍 Access Points:
echo   🌐 React Dashboard: http://localhost:3000
echo   🔗 Middleware API: http://localhost:3001  
echo   📊 CMS Service: http://localhost:8000
echo   🗺️  ROS Service: http://localhost:8001
echo   📦 WMS Service: http://localhost:8002
echo.
echo 💡 Tips:
echo   • Use the Client Portal to create accounts and orders
echo   • Use the Driver App to manage deliveries
echo   • Watch the System Tracker for real-time activity
echo   • Check Request/Response viewers for API data
echo.
echo 🛑 Press any key to exit...
pause >nul
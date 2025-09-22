@echo off
echo ========================================
echo  Swift Logistics - Kill Port Processes
echo ========================================
echo.

echo Killing processes on ports 8000, 8001, 8002, 3001...
echo.

REM Kill processes by port using PowerShell
powershell -Command "Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in @(8000,8001,8002,3001)} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo.
echo Killing any remaining Python and Node processes...
taskkill /IM python.exe /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1

echo.
echo ✓ All Swift Logistics ports should now be free!
echo You can now run: start_all_services.ps1
echo.
pause
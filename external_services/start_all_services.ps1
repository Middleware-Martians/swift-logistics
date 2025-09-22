# Swift Logistics - Start All Services
# PowerShell Script Version

Write-Host "========================================" -ForegroundColor Blue
Write-Host " Swift Logistics - Starting All Services" -ForegroundColor Blue  
Write-Host "========================================" -ForegroundColor Blue
Write-Host

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Starting all Swift Logistics services..." -ForegroundColor Cyan
Write-Host

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $false  # Port is in use
    }
    catch {
        return $true   # Port is available
    }
}

# Check ports availability
$ports = @(8000, 8001, 8002, 9000)
foreach ($port in $ports) {
    if (-not (Test-Port $port)) {
        Write-Host "Port $port is already in use. Please stop the service and try again." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

try {
    # Start CMS Service on port 8001
    Write-Host "Starting CMS (Customer Management System) on port 8000..." -ForegroundColor Yellow
    $cmsJob = Start-Job -ScriptBlock {
        Set-Location "$using:ScriptDir\cms"
        python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
    }
    Write-Host "CMS Service Started (Job ID: $($cmsJob.Id)) on http://localhost:8000" -ForegroundColor Green
    
    # Wait before starting next service
    Start-Sleep -Seconds 2
    
    # Start WMS Service on port 8002
    Write-Host "Starting WMS (Warehouse Management System) on port 8001..." -ForegroundColor Yellow
    $wmsJob = Start-Job -ScriptBlock {
        Set-Location "$using:ScriptDir\wms" 
        python -m uvicorn app:app --reload --host 0.0.0.0 --port 8001
    }
    Write-Host "WMS Service Started (Job ID: $($wmsJob.Id)) on http://localhost:8001" -ForegroundColor Green
    
    # Wait before starting next service  
    Start-Sleep -Seconds 2
    
    # Start ROS Service on port 8003
    Write-Host "Starting ROS (Route Optimization System) on port 8002..." -ForegroundColor Yellow
    $rosJob = Start-Job -ScriptBlock {
        Set-Location "$using:ScriptDir\ros"
        python -m uvicorn app:app --reload --host 0.0.0.0 --port 8002
    }
    Write-Host "ROS Service Started (Job ID: $($rosJob.Id)) on http://localhost:8002" -ForegroundColor Green
    
    # Wait before starting next service
    Start-Sleep -Seconds 2
    
    # Start TCP Server on port 9000
    Write-Host "Starting TCP Server on port 9000..." -ForegroundColor Yellow
    $tcpJob = Start-Job -ScriptBlock {
        Set-Location "$using:ScriptDir\wms"
        python simple_tcp_server.py
    }
    Write-Host "TCP Server Started (Job ID: $($tcpJob.Id)) on 127.0.0.1:9000" -ForegroundColor Green
    
    # Wait for all services to start
    Start-Sleep -Seconds 3
    
    Write-Host
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " All Services Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host
    Write-Host "Service Endpoints:" -ForegroundColor Cyan
    Write-Host "- CMS (Customer Management):    http://localhost:8000"
    Write-Host "- WMS (Warehouse Management):   http://localhost:8001"
    Write-Host "- ROS (Route Optimization):     http://localhost:8002"
    Write-Host "- TCP Server:                   127.0.0.1:9000"
    Write-Host
    Write-Host "API Documentation:" -ForegroundColor Cyan
    Write-Host "- CMS Swagger UI:  http://localhost:8000/docs"
    Write-Host "- WMS Swagger UI:  http://localhost:8001/docs"
    Write-Host "- ROS Swagger UI:  http://localhost:8002/docs"
    Write-Host
    Write-Host "Job IDs:" -ForegroundColor Cyan
    Write-Host "- CMS Job: $($cmsJob.Id)"
    Write-Host "- WMS Job: $($wmsJob.Id)"
    Write-Host "- ROS Job: $($rosJob.Id)" 
    Write-Host "- TCP Job: $($tcpJob.Id)"
    Write-Host
    Write-Host "To stop all services, run: ./stop_all_services.ps1" -ForegroundColor Yellow
    Write-Host
    Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow
    
    # Keep script running and handle Ctrl+C
    try {
        while ($true) {
            Start-Sleep -Seconds 1
            
            # Check if any jobs have failed
            $jobs = @($cmsJob, $wmsJob, $rosJob, $tcpJob)
            foreach ($job in $jobs) {
                if ($job.State -eq "Failed") {
                    Write-Host "Service job $($job.Id) has failed!" -ForegroundColor Red
                    Receive-Job $job
                }
            }
        }
    }
    catch {
        Write-Host
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        Stop-Job $cmsJob, $wmsJob, $rosJob, $tcpJob -ErrorAction SilentlyContinue
        Remove-Job $cmsJob, $wmsJob, $rosJob, $tcpJob -ErrorAction SilentlyContinue
        Write-Host "All services stopped." -ForegroundColor Green
    }
}
catch {
    Write-Host "Error starting services: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
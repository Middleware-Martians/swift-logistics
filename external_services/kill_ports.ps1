# Swift Logistics - Kill Ports Utility
# This script kills all processes running on Swift Logistics ports

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Swift Logistics - Kill Port Processes" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define the ports used by Swift Logistics
$ports = @(8000, 8001, 8002, 3001, 3000)
$serviceNames = @{
    8000 = "CMS (Content Management System)"
    8001 = "WMS (Warehouse Management System)" 
    8002 = "ROS (Routing Optimization System)"
    3001 = "Middleware API"
    3000 = "Frontend React App"
}

$killedCount = 0

foreach ($port in $ports) {
    Write-Host "Checking port $port ($($serviceNames[$port]))..." -ForegroundColor Yellow
    
    # Get processes listening on this port
    $processes = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        $line = $_.Line
        if ($line -match "LISTENING\s+(\d+)") {
            $matches[1]
        }
    } | Sort-Object -Unique
    
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                $processInfo = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($processInfo) {
                    Write-Host "  Killing PID $pid ($($processInfo.ProcessName))..." -ForegroundColor Red
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    $killedCount++
                    Write-Host "  ✓ Process $pid terminated" -ForegroundColor Green
                } else {
                    Write-Host "  Process $pid not found" -ForegroundColor Gray
                }
            }
            catch {
                Write-Host "  Failed to kill PID $pid" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  No processes found on port $port" -ForegroundColor Gray
    }
}

Write-Host ""
if ($killedCount -gt 0) {
    Write-Host "✓ Successfully killed $killedCount process(es)" -ForegroundColor Green
} else {
    Write-Host "✓ No processes needed to be killed" -ForegroundColor Green
}

Write-Host ""
Write-Host "All Swift Logistics ports are now free!" -ForegroundColor Cyan
Write-Host "You can now run: .\start_all_services.ps1" -ForegroundColor Yellow
Write-Host ""
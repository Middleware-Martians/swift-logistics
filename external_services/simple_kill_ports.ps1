Write-Host "Killing Swift Logistics processes..." -ForegroundColor Cyan

$ports = @(8000, 8001, 8002, 3001, 3000)

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Yellow
    
    $pids = netstat -ano | findstr ":$port " | findstr "LISTENING" | ForEach-Object {
        $_.Split(' ', [StringSplitOptions]::RemoveEmptyEntries)[-1]
    }
    
    foreach ($processId in $pids) {
        if ($processId -and $processId -ne "") {
            Write-Host "Killing process $processId on port $port" -ForegroundColor Red
            taskkill /f /pid $processId 2>$null
        }
    }
}

Write-Host "Done! All ports should be free now." -ForegroundColor Green
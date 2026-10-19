# Synapse Backend Launcher
# Ensures Docker Desktop and synapse-db are running, then starts the Express backend
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       SYNAPSE BACKEND LAUNCHER         " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Start Docker Desktop if not running
$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[1/3] Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 20; $i++) {
        Start-Sleep 2
        $r = & $docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      Docker daemon ready!" -ForegroundColor Green
            break
        }
        Write-Host "      ...waiting for Docker ($($i*2)s)"
    }
} else {
    Write-Host "[1/3] Docker daemon is running." -ForegroundColor Green
}

# 2. Ensure synapse-db is running
$dbState = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($dbState -ne 'true') {
    Write-Host "[2/3] Starting synapse-db container..." -ForegroundColor Yellow
    & $docker start synapse-db | Out-Null
    Start-Sleep 2
    Write-Host "      synapse-db is now running on port 5433." -ForegroundColor Green
} else {
    Write-Host "[2/3] synapse-db container is running." -ForegroundColor Green
}

# 3. Start Express server
Write-Host "[3/3] Starting Synapse Express Server..." -ForegroundColor Cyan
Set-Location -Path "e:\synepse\backend"
node src/server.js

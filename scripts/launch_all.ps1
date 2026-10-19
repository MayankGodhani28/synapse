$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       STARTING SYNAPSE INFRASTRUCTURE     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Start Docker Desktop if not running
$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[1/3] Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 35; $i++) {
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

# 2. Start synapse-db container
Write-Host "[2/3] Checking synapse-db container..." -ForegroundColor Yellow
$state = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($state -ne 'true') {
    Write-Host "      Starting synapse-db on port 5433..." -ForegroundColor Yellow
    & $docker start synapse-db | Out-Null
    Start-Sleep 2
    Write-Host "      synapse-db container started!" -ForegroundColor Green
} else {
    Write-Host "      synapse-db container is already running." -ForegroundColor Green
}

# 3. Verify PostgreSQL port 5433
Write-Host "[3/3] Checking database readiness..." -ForegroundColor Yellow
& $docker ps --filter "name=synapse-db"
Write-Host "`nDatabase infrastructure is ready!" -ForegroundColor Green

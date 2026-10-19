# Ensure Docker Desktop is active and synapse-db is up
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$running = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $running) {
    Write-Host "Launching Docker Desktop..."
    Start-Process -FilePath $dockerDesktopExe
}

Write-Host "Waiting for Docker daemon..."
for ($i = 1; $i -le 20; $i++) {
    Start-Sleep 2
    $r = & $docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker daemon is ready!" -ForegroundColor Green
        break
    }
}

# Check if synapse-db is running, if not start it
$dbState = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($dbState -ne 'true') {
    Write-Host "Starting synapse-db container..."
    & $docker start synapse-db | Out-Null
    Start-Sleep 2
}

& $docker ps --filter "name=synapse-db"

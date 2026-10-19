$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting Docker Desktop..."
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 15; $i++) {
        Start-Sleep 2
        $r = & $docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker daemon ready!"
            break
        }
    }
}

Write-Host "`n=== Docker Containers ===" -ForegroundColor Cyan
& $docker ps

Write-Host "`n=== synapse-db Port Mappings ===" -ForegroundColor Cyan
& $docker port synapse-db

Write-Host "`n=== Testing Node.js connection ===" -ForegroundColor Cyan
Set-Location -Path "e:\synepse\backend"
node test_db_connection.js

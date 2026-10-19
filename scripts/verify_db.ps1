# Ensure Docker Desktop is running, start synapse-db if stopped, and verify DB
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting Docker Desktop..."
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 12; $i++) {
        Start-Sleep 3
        $r = & $docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Daemon ready!"
            break
        }
    }
}

# Start container if stopped
$status = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($status -ne 'true') {
    Write-Host "Starting synapse-db container..."
    & $docker start synapse-db | Out-Null
    Start-Sleep 2
}

Write-Host "`n=== [1] Container Status ===" -ForegroundColor Cyan
& $docker ps --filter "name=synapse-db"

Write-Host "`n=== [2] Table Verification in 'synapse' ===" -ForegroundColor Cyan
& $docker exec synapse-db psql -U postgres -d synapse -c "\dt"

Write-Host "`n=== [3] pgvector Extension Verification ===" -ForegroundColor Cyan
& $docker exec synapse-db psql -U postgres -d synapse -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

Write-Host "`n=== [4] Seeded Memories Query ===" -ForegroundColor Cyan
& $docker exec synapse-db psql -U postgres -d synapse -c "SELECT id, user_id, content, source_type, created_at FROM memories;"

Write-Host "`n=== [5] Seeded Users Query ===" -ForegroundColor Cyan
& $docker exec synapse-db psql -U postgres -d synapse -c "SELECT id, email, created_at FROM users;"

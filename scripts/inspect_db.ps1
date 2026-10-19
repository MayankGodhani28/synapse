# Inspect the contents of the Synapse database on port 5433
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Connecting to Docker daemon..." -ForegroundColor Gray
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 12; $i++) {
        Start-Sleep 2
        $r = & $docker ps 2>&1
        if ($LASTEXITCODE -eq 0) { break }
    }
}

# Ensure synapse-db is running
$status = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($status -ne 'true') {
    & $docker start synapse-db | Out-Null
    Start-Sleep 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         SYNAPSE DATABASE VIEWER        " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[1] MEMORIES (Latest First):" -ForegroundColor Yellow
& $docker exec synapse-db psql -U postgres -d synapse -c "SELECT id, user_id, source_type, LEFT(content, 60) AS content_preview, source_url, created_at FROM memories ORDER BY created_at DESC LIMIT 10;"

Write-Host "`n[2] EMBEDDINGS (Latest First):" -ForegroundColor Yellow
& $docker exec synapse-db psql -U postgres -d synapse -c "SELECT id, memory_id, LEFT(chunk_text, 50) AS chunk_preview, (embedding IS NOT NULL) AS has_vector, created_at FROM embeddings ORDER BY created_at DESC LIMIT 10;"

Write-Host "`n[3] TOTAL ROW COUNTS:" -ForegroundColor Yellow
& $docker exec synapse-db psql -U postgres -d synapse -c "SELECT 'memories' AS table_name, count(*) FROM memories UNION ALL SELECT 'embeddings', count(*) FROM embeddings UNION ALL SELECT 'users', count(*) FROM users;"

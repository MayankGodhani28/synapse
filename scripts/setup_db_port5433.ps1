# Recreate synapse-db container on port 5433 with --restart unless-stopped
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 15; $i++) { Start-Sleep 2; $r = & $docker ps 2>&1; if ($LASTEXITCODE -eq 0) { break } }
}

Write-Host "Cleaning old containers..."
& $docker stop synapse-db 2>&1 | Out-Null
& $docker rm synapse-db 2>&1 | Out-Null

Write-Host "Starting synapse-db with --restart unless-stopped on port 5433..." -ForegroundColor Cyan
& $docker run --name synapse-db `
  --restart unless-stopped `
  -e POSTGRES_PASSWORD=yourpassword `
  -e POSTGRES_HOST_AUTH_METHOD=trust `
  -p 5433:5432 `
  -d pgvector/pgvector:pg16

Write-Host "Waiting for Postgres to be ready..."
for ($i = 1; $i -le 15; $i++) {
  Start-Sleep 2
  $ready = & $docker exec synapse-db pg_isready -U postgres 2>&1
  if ($ready -match "accepting") {
    Write-Host "Postgres ready!" -ForegroundColor Green
    break
  }
  Write-Host "  ...waiting ($($i*2)s)"
}

Write-Host "`nInitializing database..." -ForegroundColor Cyan
& $docker exec synapse-db psql -U postgres -c "CREATE DATABASE synapse;"
& $docker exec synapse-db psql -U postgres -d synapse -c "CREATE EXTENSION IF NOT EXISTS vector;"

$schemaSql = Get-Content "e:\synepse\db\schema.sql" -Raw
$schemaSql | & $docker exec -i synapse-db psql -U postgres -d synapse

$migrateSql = @"
DROP INDEX IF EXISTS embeddings_embedding_idx;
DELETE FROM embeddings;
ALTER TABLE embeddings ALTER COLUMN embedding TYPE VECTOR(384);
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
"@
$migrateSql | & $docker exec -i synapse-db psql -U postgres -d synapse

Write-Host "`nTesting Node.js connection..." -ForegroundColor Cyan
Set-Location "e:\synepse\backend"
node test_db_connection.js

# Recreate synapse-db container with POSTGRES_HOST_AUTH_METHOD=trust
# This makes Postgres allow all connections without a password (fine for local dev)
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 12; $i++) { Start-Sleep 3; $r = & $docker ps 2>&1; if ($LASTEXITCODE -eq 0) { break } }
}

# Stop and remove old container (schema is in schema.sql, easy to re-apply)
Write-Host "Stopping and removing old synapse-db container..." -ForegroundColor Yellow
& $docker stop synapse-db 2>&1 | Out-Null
& $docker rm synapse-db 2>&1 | Out-Null

Write-Host "Creating new synapse-db with trust auth..." -ForegroundColor Cyan
& $docker run --name synapse-db `
  -e POSTGRES_PASSWORD=yourpassword `
  -e POSTGRES_HOST_AUTH_METHOD=trust `
  -p 5432:5432 `
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

# Re-create database + extension + schema
Write-Host "`nCreating synapse database and enabling pgvector..." -ForegroundColor Cyan
& $docker exec synapse-db psql -U postgres -c "CREATE DATABASE synapse;"
& $docker exec synapse-db psql -U postgres -d synapse -c "CREATE EXTENSION IF NOT EXISTS vector;"

Write-Host "Applying schema (384-dim)..." -ForegroundColor Cyan
$schemaSql = Get-Content "e:\synepse\db\schema.sql" -Raw
$schemaSql | & $docker exec -i synapse-db psql -U postgres -d synapse

Write-Host "Migrating vector dim to 384..." -ForegroundColor Cyan
$migrateSql = @"
DROP INDEX IF EXISTS embeddings_embedding_idx;
DELETE FROM embeddings;
ALTER TABLE embeddings ALTER COLUMN embedding TYPE VECTOR(384);
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
"@
$migrateSql | & $docker exec -i synapse-db psql -U postgres -d synapse

Write-Host "`n✅ synapse-db recreated with trust auth. Tables:" -ForegroundColor Green
& $docker exec synapse-db psql -U postgres -d synapse -c "\dt"

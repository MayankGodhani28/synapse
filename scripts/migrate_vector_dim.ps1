# Migrate the embeddings.embedding column from VECTOR(1536) to VECTOR(384)
# Required because we're using all-MiniLM-L6-v2 (384 dims) instead of OpenAI (1536 dims)

$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

# Ensure Docker + container running
$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Gray
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 12; $i++) {
        Start-Sleep 3
        $r = & $docker ps 2>&1
        if ($LASTEXITCODE -eq 0) { Write-Host "Daemon ready!"; break }
    }
}

$status = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($status -ne 'true') {
    Write-Host "Starting synapse-db..." -ForegroundColor Gray
    & $docker start synapse-db | Out-Null
    Start-Sleep 3
}

Write-Host "Migrating embeddings column: VECTOR(1536) -> VECTOR(384)..." -ForegroundColor Cyan

$sql = @"
-- Drop the existing ivfflat index (it's tied to the old dimension)
DROP INDEX IF EXISTS embeddings_embedding_idx;

-- Wipe any embeddings generated with 1536-dim model (incompatible)
DELETE FROM embeddings;

-- Change the column type to 384 dimensions (all-MiniLM-L6-v2)
ALTER TABLE embeddings ALTER COLUMN embedding TYPE VECTOR(384);

-- Recreate the ivfflat index for the new dimension
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Confirm
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'embeddings' AND column_name = 'embedding';
"@

$sql | & $docker exec -i synapse-db psql -U postgres -d synapse

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nMigration complete! embeddings.embedding is now VECTOR(384)." -ForegroundColor Green
} else {
    Write-Host "`nMigration failed. Check output above." -ForegroundColor Red
}

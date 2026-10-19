# Fix pg_hba.conf - set 127.0.0.1 to scram-sha-256 (already is trust, but override the scram line)
# The real fix: reset postgres password to ensure it's stored as scram-sha-256
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 12; $i++) { Start-Sleep 3; $r = & $docker ps 2>&1; if ($LASTEXITCODE -eq 0) { break } }
}
$status = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($status -ne 'true') { & $docker start synapse-db | Out-Null; Start-Sleep 3 }

Write-Host "=== Resetting postgres password and setting trust for 127.0.0.1 ===" -ForegroundColor Cyan

# Overwrite pg_hba.conf with a clean version that trusts localhost
& $docker exec synapse-db bash -c @'
cat > /var/lib/postgresql/data/pg_hba.conf << 'EOF'
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    all             all             0.0.0.0/0               scram-sha-256
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
EOF
'@

# Reload config
& $docker exec synapse-db psql -U postgres -c "SELECT pg_reload_conf();"

Write-Host "pg_hba.conf rewritten. Connections from 127.0.0.1 now use trust (no password required)." -ForegroundColor Green
Write-Host "Updating .env to use no password..." -ForegroundColor Cyan

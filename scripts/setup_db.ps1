# Synapse — DB setup (fixed Docker launcher path)
# Uses the correct root-level Docker Desktop.exe

Set-StrictMode -Off
$ErrorActionPreference = 'Continue'

# Hardcoded correct paths (confirmed from install listing)
$dockerExe       = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'

# ── 1. Validate executables exist ─────────────────────────────────────────
Write-Host "`n[1/6] Validating Docker executables..." -ForegroundColor Cyan

if (-not (Test-Path $dockerExe)) {
  Write-Host "  ERROR: docker.exe not found at: $dockerExe" -ForegroundColor Red
  exit 1
}
Write-Host "  docker.exe      : $dockerExe" -ForegroundColor Green

if (-not (Test-Path $dockerDesktopExe)) {
  Write-Host "  ERROR: Docker Desktop.exe not found at: $dockerDesktopExe" -ForegroundColor Red
  exit 1
}
Write-Host "  Docker Desktop  : $dockerDesktopExe" -ForegroundColor Green

# ── 2. Check if daemon already running ───────────────────────────────────
Write-Host "`n[2/6] Checking Docker daemon..." -ForegroundColor Cyan

$daemonReady = $false
$result = & $dockerExe ps 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "  Daemon already running." -ForegroundColor Green
  $daemonReady = $true
} else {
  Write-Host "  Daemon not running. Launching Docker Desktop GUI..."
  Start-Process -FilePath $dockerDesktopExe
  Write-Host "  Docker Desktop launched. Waiting up to 3 minutes for daemon..."
  Write-Host "  (Docker may show a first-run dialog on your screen — click through it)"

  for ($i = 1; $i -le 36; $i++) {
    Start-Sleep 5
    $r = & $dockerExe ps 2>&1
    if ($LASTEXITCODE -eq 0) {
      Write-Host "  Daemon ready after $($i*5)s!" -ForegroundColor Green
      $daemonReady = $true
      break
    }
    Write-Host "  ...waiting ($($i*5)s / 180s)"
  }
}

if (-not $daemonReady) {
  Write-Host ""
  Write-Host "  TIMEOUT: Docker daemon didn't start in 3 minutes." -ForegroundColor Red
  Write-Host "  Please open Docker Desktop from the Start Menu manually," -ForegroundColor Yellow
  Write-Host "  wait for it to show 'Docker Desktop is running'," -ForegroundColor Yellow
  Write-Host "  then re-run this script." -ForegroundColor Yellow
  exit 1
}

& $dockerExe ps

# ── 3. Start / create synapse-db container ────────────────────────────────
Write-Host "`n[3/6] Setting up synapse-db container..." -ForegroundColor Cyan

$existing = & $dockerExe ps -a --filter "name=synapse-db" --format "{{.Names}}" 2>&1
if ($existing -match 'synapse-db') {
  Write-Host "  Container exists — starting it..."
  & $dockerExe start synapse-db | Out-Null
} else {
  Write-Host "  Creating new container (pulling pgvector/pgvector:pg16)..."
  & $dockerExe run --name synapse-db `
    -e 'POSTGRES_PASSWORD=yourpassword' `
    -p 5432:5432 `
    -d pgvector/pgvector:pg16
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: docker run failed." -ForegroundColor Red
    exit 1
  }
}
Write-Host "  Container running." -ForegroundColor Green

# Wait for Postgres to accept connections
Write-Host "  Waiting for Postgres to be ready..."
for ($i = 1; $i -le 20; $i++) {
  Start-Sleep 2
  $ready = & $dockerExe exec synapse-db pg_isready -U postgres 2>&1
  if ($ready -match 'accepting connections') {
    Write-Host "  Postgres ready!" -ForegroundColor Green
    break
  }
  Write-Host "  ...waiting ($($i*2)s)"
}

# ── 4. Create database + enable pgvector ──────────────────────────────────
Write-Host "`n[4/6] Creating database and enabling pgvector..." -ForegroundColor Cyan
& $dockerExe exec synapse-db psql -U postgres -c "CREATE DATABASE synapse;" 2>&1 | Out-Null
& $dockerExe exec synapse-db psql -U postgres -d synapse -c "CREATE EXTENSION IF NOT EXISTS vector;"
Write-Host "  Done." -ForegroundColor Green

# ── 5. Apply schema ───────────────────────────────────────────────────────
Write-Host "`n[5/6] Applying schema..." -ForegroundColor Cyan
$schemaPath = Join-Path $PSScriptRoot '..\db\schema.sql'
Get-Content $schemaPath | & $dockerExe exec -i synapse-db psql -U postgres -d synapse
if ($LASTEXITCODE -ne 0) {
  Write-Host "  ERROR: Schema apply failed." -ForegroundColor Red
  exit 1
}
Write-Host "  Schema applied." -ForegroundColor Green

# ── 6. Verify + seed ──────────────────────────────────────────────────────
Write-Host "`n[6/6] Verifying tables and seeding test data..." -ForegroundColor Cyan
& $dockerExe exec synapse-db psql -U postgres -d synapse -c '\dt'

$seedSql = @'
DO $$
DECLARE
  uid UUID;
  mid UUID;
BEGIN
  INSERT INTO users (email, password_hash)
    VALUES ('test@example.com', 'dummyhash')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO uid;
  IF uid IS NULL THEN
    SELECT id INTO uid FROM users WHERE email = 'test@example.com';
  END IF;
  INSERT INTO memories (user_id, content, source_type)
    VALUES (uid, 'Test memory content', 'note')
    RETURNING id INTO mid;
  RAISE NOTICE 'Created memory id: %', mid;
END;
$$;
SELECT id, user_id, content, source_type, created_at FROM memories;
'@

$seedSql | & $dockerExe exec -i synapse-db psql -U postgres -d synapse

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " Synapse DB is ready!" -ForegroundColor Green
Write-Host " postgresql://postgres:yourpassword@localhost:5432/synapse" -ForegroundColor Yellow
Write-Host "================================================`n" -ForegroundColor Cyan

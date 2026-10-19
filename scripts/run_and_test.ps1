# Synapse Full Stack Backend Test Runner
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     SYNAPSE RETRIEVAL & CHAT RUNNER    " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Start Docker Desktop if not running
$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[1/4] Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 20; $i++) {
        Start-Sleep 2
        $r = & $docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      Docker daemon ready!" -ForegroundColor Green
            break
        }
    }
} else {
    Write-Host "[1/4] Docker daemon is running." -ForegroundColor Green
}

# 2. Ensure synapse-db is up on port 5433
$dbState = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($dbState -ne 'true') {
    Write-Host "[2/4] Starting synapse-db container..." -ForegroundColor Yellow
    & $docker start synapse-db | Out-Null
    Start-Sleep 2
}
Write-Host "[2/4] synapse-db is active on port 5433." -ForegroundColor Green

# Ensure user_id column in memories is TEXT to support test-user, TEMP_USER_ID, etc.
& $docker exec synapse-db psql -U postgres -d synapse -c "ALTER TABLE memories ALTER COLUMN user_id TYPE TEXT;" 2>&1 | Out-Null

# 3. Kill any old node process and start backend server
Write-Host "[3/4] Starting Express server on port 5000..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 1

Set-Location -Path "e:\synepse\backend"
$serverProc = Start-Process node -ArgumentList "src/server.js" -PassThru

# 4. Wait for server health check
Write-Host "[4/4] Waiting for backend to be ready..." -ForegroundColor Yellow
$healthy = $false
for ($i = 1; $i -le 15; $i++) {
    Start-Sleep 1
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($res.status -eq "ok") {
            Write-Host "      Server is live on http://localhost:5000!`n" -ForegroundColor Green
            $healthy = $true
            break
        }
    } catch {
        # continue waiting
    }
}

if (-not $healthy) {
    Write-Host "❌ Server failed to start in time." -ForegroundColor Red
    exit 1
}

# 5. Run end-to-end test suite
Write-Host "Executing automated API test suite..." -ForegroundColor Cyan
node test_api_endpoints.js

$testResult = $LASTEXITCODE
if ($testResult -eq 0) {
    Write-Host "`nAll Synapse endpoints verified and functional!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Check logs above." -ForegroundColor Red
}

exit $testResult

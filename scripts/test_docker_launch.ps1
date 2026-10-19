# Wait for Docker daemon to fully initialize (engine was starting but not ready yet)
$dockerExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

Write-Host "Docker Desktop is running. Waiting for engine to finish initializing..."

for ($i = 1; $i -le 24; $i++) {
  Start-Sleep 5
  $r = & $dockerExe ps 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Engine ready after $($i*5)s!" -ForegroundColor Green
    & $dockerExe ps
    exit 0
  }
  $shortErr = ($r | Out-String).Trim() -replace "`n"," " | Select-Object -First 1
  Write-Host "  [$($i*5)s] $shortErr"
}

Write-Host "Still not ready after 120s. Running docker info for details..." -ForegroundColor Yellow
& $dockerExe info 2>&1

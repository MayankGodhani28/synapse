# Reset Docker Desktop to factory defaults to fix "unable to start"
# This clears all containers/images but fixes startup issues

$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'

Write-Host "Stopping Docker Desktop processes..." -ForegroundColor Cyan
Stop-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue -Force
Stop-Process -Name 'com.docker.backend' -ErrorAction SilentlyContinue -Force
Stop-Process -Name 'com.docker.build' -ErrorAction SilentlyContinue -Force
Start-Sleep 3

Write-Host "Removing Docker Desktop data (reset to factory)..." -ForegroundColor Cyan
# Remove WSL distros if they exist
wsl --unregister docker-desktop 2>&1 | Out-Null
wsl --unregister docker-desktop-data 2>&1 | Out-Null

# Remove Docker Desktop settings that may be corrupted
$settingsPath = "$env:APPDATA\Docker\settings-store.json"
if (Test-Path $settingsPath) {
  Remove-Item $settingsPath -Force
  Write-Host "  Removed settings-store.json"
}

# Remove the install-settings.json from ProgramData
$programDataSettings = 'C:\ProgramData\DockerDesktop\install-settings.json'
if (Test-Path $programDataSettings) {
  Remove-Item $programDataSettings -Force
  Write-Host "  Removed install-settings.json"
}

Write-Host ""
Write-Host "Relaunching Docker Desktop (clean start)..." -ForegroundColor Cyan
Start-Process $dockerDesktopExe

Write-Host "Waiting 90 seconds for fresh startup..." -ForegroundColor Cyan
for ($i = 1; $i -le 18; $i++) {
  Start-Sleep 5
  $r = & $docker ps 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker daemon is READY after $($i*5)s!" -ForegroundColor Green
    & $docker ps
    exit 0
  }
  Write-Host "  ...waiting ($($i*5)s / 90s) — $($r | Select-Object -First 1)"
}

Write-Host ""
Write-Host "Still not ready after 90s. Check Docker Desktop on screen for any dialogs." -ForegroundColor Yellow
& $docker info 2>&1

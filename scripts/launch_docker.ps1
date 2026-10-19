# Launch Docker Desktop from confirmed install path and wait for daemon
$desktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$dockerCli  = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

# Also add docker to PATH for this session
$binPath = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin'
if ($env:PATH -notlike "*$binPath*") {
  $env:PATH = "$binPath;$env:PATH"
  Write-Host "Added docker bin to PATH for this session."
}

# Check if Docker daemon already running
$already = docker ps 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "Docker daemon already running."
} else {
  Write-Host "Starting Docker Desktop..."
  Start-Process $desktopExe
  Write-Host "Waiting up to 90 seconds for Docker daemon to be ready..."
  for ($i = 1; $i -le 18; $i++) {
    Start-Sleep 5
    $r = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Docker daemon ready after $($i * 5) seconds."
      break
    }
    Write-Host "  ...waiting ($($i*5)s / 90s)"
  }
}

docker ps

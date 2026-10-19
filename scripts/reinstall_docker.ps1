# Re-run Docker Desktop installer without elevation (ProgramData dir now pre-created)
$installer = "$env:TEMP\DockerDesktopInstaller.exe"

if (-not (Test-Path $installer)) {
  Write-Host "Installer not in TEMP. Re-downloading..."
  Invoke-WebRequest -Uri "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" `
    -OutFile $installer -UseBasicParsing
  Write-Host "Downloaded."
} else {
  Write-Host "Installer found at: $installer"
}

# Pre-create required ProgramData path so installer doesn't fail
New-Item -ItemType Directory -Force 'C:\ProgramData\DockerDesktop' | Out-Null
Write-Host "Ensured C:\ProgramData\DockerDesktop exists."

Write-Host "Running installer (no elevation)..."
$proc = Start-Process -FilePath $installer `
  -ArgumentList "install", "--quiet", "--accept-license" `
  -Wait -PassThru

Write-Host "Installer exit code: $($proc.ExitCode)"

# Check result
$binPath = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop'
if (Test-Path $binPath) {
  $count = (Get-ChildItem $binPath -Recurse -ErrorAction SilentlyContinue).Count
  Write-Host "DockerDesktop directory has $count items."
  if ($count -gt 0) {
    Write-Host "SUCCESS — Docker Desktop is installed!"
    Get-ChildItem $binPath | Select-Object Name | Format-Table -AutoSize
  }
} else {
  Write-Host "DockerDesktop directory still missing."
}

# Download Docker Desktop installer and run it silently
# WSL2 backend is required — ensure WSL2 is installed first

$installerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$installerPath = "$env:TEMP\DockerDesktopInstaller.exe"

Write-Host "Downloading Docker Desktop installer..."
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing

Write-Host "Running installer (this will take a few minutes)..."
# 'install' flag, --quiet suppresses UI, --accept-license skips EULA
Start-Process -FilePath $installerPath -ArgumentList "install", "--quiet", "--accept-license" -Wait

Write-Host "Docker Desktop install complete. Please restart your machine if prompted."
Write-Host "After restart, open Docker Desktop once to finish WSL2 setup, then run the database commands in README.md."

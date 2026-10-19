$ErrorActionPreference = 'Stop'
$url = 'https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/MinGit-2.55.0.5-64-bit.zip'
$dest = Join-Path $env:TEMP 'MinGit.zip'
$target = Join-Path $env:LOCALAPPDATA 'Programs\Git'

Write-Host "Downloading MinGit from $url..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $dest

Write-Host "Extracting to $target..." -ForegroundColor Cyan
if (!(Test-Path $target)) {
    New-Item -ItemType Directory -Force -Path $target | Out-Null
}
Expand-Archive -Path $dest -DestinationPath $target -Force
Remove-Item $dest -Force

$gitExe = Join-Path $target 'cmd\git.exe'
Write-Host "Testing git..." -ForegroundColor Green
& $gitExe --version

# Add to user PATH permanently if not present
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$gitCmdPath = Join-Path $target 'cmd'
if ($userPath -notlike "*$gitCmdPath*") {
    $newUserPath = "$gitCmdPath;$userPath"
    [Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')
    Write-Host "Added $gitCmdPath to user PATH" -ForegroundColor Green
}
$env:Path = "$gitCmdPath;$env:Path"
Write-Host "Git setup complete!" -ForegroundColor Green

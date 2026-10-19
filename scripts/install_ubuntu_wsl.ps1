# Step 1: Install Ubuntu in WSL2 and set up Docker Engine inside it
# This bypasses Docker Desktop entirely

Write-Host "=== Step 1: Installing Ubuntu in WSL2 ===" -ForegroundColor Cyan
Write-Host "This will download Ubuntu (~500MB). Please wait..." -ForegroundColor Yellow

# Install Ubuntu (non-interactive)
wsl --install -d Ubuntu --no-launch 2>&1
$exitCode = $LASTEXITCODE
Write-Host "wsl --install exit code: $exitCode"

# Check what distros are available now
Write-Host ""
Write-Host "=== WSL distros after install ===" -ForegroundColor Cyan
wsl --list --verbose 2>&1

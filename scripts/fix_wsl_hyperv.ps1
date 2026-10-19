# WSL's own recommended fix for HCS_E_HYPERV_NOT_INSTALLED
Write-Host "=== WSL self-fix: --install --no-distribution ===" -ForegroundColor Cyan
wsl --install --no-distribution 2>&1
Write-Host "Exit code: $LASTEXITCODE"

Write-Host ""
Write-Host "=== WSL update ===" -ForegroundColor Cyan
wsl --update 2>&1
Write-Host "Exit code: $LASTEXITCODE"

Write-Host ""
Write-Host "=== vmcompute service ===" -ForegroundColor Cyan
Get-Service vmcompute -ErrorAction SilentlyContinue | Select-Object Name, Status, StartType

Write-Host ""
Write-Host "=== Check if VirtualMachinePlatform is actually enabled ===" -ForegroundColor Cyan
# Use reg query as alternative to dism (doesn't need elevation)
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Virtualization" 2>&1
reg query "HKLM\SYSTEM\CurrentControlSet\Services\WinHv" 2>&1 | Select-Object -First 5

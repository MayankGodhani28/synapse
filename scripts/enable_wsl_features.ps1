# Check and enable required Windows features for Docker Desktop (WSL2)
# Must run as administrator

Write-Host "=== Checking virtualization features ===" -ForegroundColor Cyan

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Host "Running as administrator: $isAdmin"

# Check CPU virtualization via WMI
$cpu = Get-WmiObject Win32_Processor | Select-Object -First 1
Write-Host "CPU: $($cpu.Name)"

# Check Hyper-V support via systeminfo
$sysinfo = systeminfo 2>&1 | Select-String -Pattern 'Hyper-V|Virtual'
$sysinfo | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== Checking Windows Optional Features ===" -ForegroundColor Cyan
# Use DISM command-line (doesn't need elevation the same way)
dism /online /get-featureinfo /featurename:Microsoft-Windows-Subsystem-Linux 2>&1 | Select-String 'State'
dism /online /get-featureinfo /featurename:VirtualMachinePlatform 2>&1 | Select-String 'State'

Write-Host ""
Write-Host "=== Enabling features if disabled ===" -ForegroundColor Cyan
if ($isAdmin) {
  Write-Host "Enabling Virtual Machine Platform..."
  dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

  Write-Host "Enabling Windows Subsystem for Linux..."
  dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

  Write-Host ""
  Write-Host "IMPORTANT: A system restart may be required after enabling these features." -ForegroundColor Yellow
} else {
  Write-Host "Not running as admin. Please run this script as Administrator to enable features." -ForegroundColor Red
  Write-Host "Or enable manually via: Settings > Apps > Optional Features > More Windows Features" -ForegroundColor Yellow
}

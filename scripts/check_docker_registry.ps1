# Check Windows registry for Docker Desktop installation record
$regPaths = @(
  'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
  'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall',
  'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall'
)

foreach ($regPath in $regPaths) {
  if (Test-Path $regPath) {
    Get-ChildItem $regPath -ErrorAction SilentlyContinue | ForEach-Object {
      $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
      if ($props.DisplayName -like '*Docker*') {
        Write-Host "Registry entry: $($props.DisplayName)"
        Write-Host "  Version:      $($props.DisplayVersion)"
        Write-Host "  Install path: $($props.InstallLocation)"
        Write-Host "  Uninstall:    $($props.UninstallString)"
        Write-Host ""
      }
    }
  }
}

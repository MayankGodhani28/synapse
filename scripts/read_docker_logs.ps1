# Read Docker VM logs
$vmDir = 'C:\Users\rudra\AppData\Local\Docker\log\vm'
if (Test-Path $vmDir) {
  $files = Get-ChildItem $vmDir | Sort-Object LastWriteTime -Descending
  Write-Host "VM log files:"
  $files | Select-Object Name, LastWriteTime | Format-Table -AutoSize

  $latest = $files | Select-Object -First 1
  if ($latest) {
    Write-Host "--- Last 60 lines of $($latest.Name) ---"
    Get-Content $latest.FullName -Tail 60
  }
} else {
  Write-Host "VM log dir not found: $vmDir"
}

Write-Host ""
Write-Host "--- Docker Desktop.exe.log (last 30 lines) ---"
Get-Content 'C:\Users\rudra\AppData\Local\Docker\log\host\Docker Desktop.exe.log' -Tail 30

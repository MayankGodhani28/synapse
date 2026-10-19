# Snapshot of Docker VM init log - to see if WSL2 kernel is booting
$initLog = 'C:\Users\rudra\AppData\Local\Docker\log\vm\init.log'
Write-Host "=== VM init.log (last 20 lines) ==="
if (Test-Path $initLog) {
  $content = Get-Content $initLog -Tail 20
  if ($content -match '---') {
    Write-Host "(only separator lines - VM not started yet)"
  } else {
    $content
  }
} else {
  Write-Host "File not found"
}

Write-Host ""
Write-Host "=== Docker processes ==="
Get-Process | Where-Object { $_.Name -like '*docker*' -or $_.Name -like '*Docker*' } |
  Select-Object Name, Id | Format-Table -AutoSize

Write-Host ""
Write-Host "=== WSL distros ==="
wsl --list --verbose 2>&1

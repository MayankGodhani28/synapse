# Find the real Docker backend crash reason
$logHost = 'C:\Users\rudra\AppData\Local\Docker\log\host'

# Read the full backend log looking for errors around VM startup
Write-Host "=== backend log - ERROR/FATAL lines ==="
Get-Content (Join-Path $logHost 'com.docker.backend.exe.log') -ErrorAction SilentlyContinue |
  Where-Object { $_ -match '\[E\]|\[F\]|error|Error|ERROR|fatal|FATAL|wsl|WSL|hypervisor|hyperv|panic|crash' } |
  Select-Object -Last 30

Write-Host ""
Write-Host "=== Electron console log (today) - errors only ==="
$eLog = Join-Path $logHost 'electron-ui-console-2026-08-25.log'
if (Test-Path $eLog) {
  Get-Content $eLog | Where-Object { $_ -match 'error|Error|ERROR|warn|WARN|fail|wsl|WSL' } | Select-Object -Last 30
}

Write-Host ""
Write-Host "=== Windows Event Log - Application errors (last 10) ==="
Get-EventLog -LogName Application -EntryType Error -Newest 10 -ErrorAction SilentlyContinue |
  Where-Object { $_.Source -match 'Docker|WSL|Hyper' } |
  Select-Object TimeGenerated, Source, Message | Format-List

Write-Host ""
Write-Host "=== Hyper-V services status ==="
Get-Service -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'vmms|HvHost|WSL|lxss|LxssManager|vmcompute' } |
  Select-Object Name, Status, DisplayName | Format-Table -AutoSize

Write-Host ""
Write-Host "=== VirtualMachinePlatform registry check ==="
$vmpKey = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Component Based Servicing\Packages'
Get-ChildItem $vmpKey -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match 'VirtualMachinePlatform' } |
  Select-Object -First 5 | ForEach-Object {
    Write-Host $_.Name
  }

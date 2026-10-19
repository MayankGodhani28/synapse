# Read pg_hba.conf and test a direct TCP connection from PowerShell
$dockerDesktopExe = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe'
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

$r = & $docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Start-Process -FilePath $dockerDesktopExe
    for ($i = 1; $i -le 12; $i++) { Start-Sleep 3; $r = & $docker ps 2>&1; if ($LASTEXITCODE -eq 0) { break } }
}
$status = & $docker inspect -f '{{.State.Running}}' synapse-db 2>&1
if ($status -ne 'true') { & $docker start synapse-db | Out-Null; Start-Sleep 3 }

Write-Host "=== Current pg_hba.conf ===" -ForegroundColor Cyan
& $docker exec synapse-db cat /var/lib/postgresql/data/pg_hba.conf

Write-Host "`n=== Port 5432 open on localhost? ===" -ForegroundColor Cyan
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", 5432)
    Write-Host "Port 5432 is OPEN" -ForegroundColor Green
    $tcp.Close()
} catch {
    Write-Host "Port 5432 is NOT reachable: $_" -ForegroundColor Red
}

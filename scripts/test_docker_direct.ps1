# Direct docker test with verbose output
$docker = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'

Write-Host "=== docker ps ==="
& $docker ps 2>&1

Write-Host ""
Write-Host "=== docker info ==="
& $docker info 2>&1

Write-Host ""
Write-Host "=== docker context ls ==="
& $docker context ls 2>&1

Write-Host ""
Write-Host "=== Try default context ==="
& $docker --context default ps 2>&1

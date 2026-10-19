# Discover Docker Desktop installation on this machine
$base = 'C:\Users\rudra\AppData\Local\Programs\DockerDesktop'
if (Test-Path $base) {
  Write-Host "DockerDesktop dir exists. Contents:"
  Get-ChildItem $base -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  $($_.Name)"
  }
} else {
  Write-Host "DockerDesktop dir does NOT exist: $base"
}

Write-Host ""
Write-Host "All Docker-related folders under AppData\Local:"
Get-ChildItem 'C:\Users\rudra\AppData\Local' -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_.Name -match 'ocker') {
    Write-Host "  $($_.Name)"
    Get-ChildItem $_.FullName -ErrorAction SilentlyContinue | Select-Object -First 5 | ForEach-Object {
      Write-Host "    $($_.Name)"
    }
  }
}

Write-Host ""
Write-Host "All Docker-related folders under AppData\Local\Programs:"
if (Test-Path 'C:\Users\rudra\AppData\Local\Programs') {
  Get-ChildItem 'C:\Users\rudra\AppData\Local\Programs' -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Name -match 'ocker') {
      Write-Host "  $($_.Name)"
      Get-ChildItem $_.FullName -ErrorAction SilentlyContinue | Select-Object -First 5 | ForEach-Object {
        Write-Host "    $($_.Name)"
      }
    }
  }
}

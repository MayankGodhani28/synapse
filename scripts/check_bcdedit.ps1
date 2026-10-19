# Check bcdedit hypervisorlaunchtype
$out = bcdedit /enum
$out | ForEach-Object {
    if ($_ -match 'hypervisorlaunchtype') {
        Write-Host "Found: $_"
    }
}
Write-Host "--- Full BCD Output ---"
$out

Add-Type -AssemblyName System.Drawing

function New-SynapseIcon {
  param(
    [int]$size,
    [string]$path
  )

  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  # Background gradient (dark navy -> deep purple)
  $rect  = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
  $c1    = [System.Drawing.Color]::FromArgb(255, 13, 15, 30)
  $c2    = [System.Drawing.Color]::FromArgb(255, 29, 15, 60)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()

  $cx = [float]($size / 2)
  $cy = [float]($size / 2)

  # Spoke lines (cyan)
  $strokeW  = [float]([Math]::Max(1, $size * 0.055))
  $spokePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(190, 6, 182, 212), $strokeW)
  $spokePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $spokePen.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round

  $angles = @(0, 45, 90, 135, 180, 225, 270, 315)
  $innerR = [float]($size * 0.20)
  $outerR = [float]($size * 0.40)

  foreach ($a in $angles) {
    $rad = $a * [Math]::PI / 180.0
    $x1 = [float]($cx + $innerR * [Math]::Cos($rad))
    $y1 = [float]($cy + $innerR * [Math]::Sin($rad))
    $x2 = [float]($cx + $outerR * [Math]::Cos($rad))
    $y2 = [float]($cy + $outerR * [Math]::Sin($rad))
    $g.DrawLine($spokePen, $x1, $y1, $x2, $y2)
  }
  $spokePen.Dispose()

  # Outer dot nodes (lavender)
  $nodeR     = [float]($size * 0.07)
  $nodeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 167, 139, 250))
  foreach ($a in $angles) {
    $rad = $a * [Math]::PI / 180.0
    $nx  = [float]($cx + $outerR * [Math]::Cos($rad) - $nodeR)
    $ny  = [float]($cy + $outerR * [Math]::Sin($rad) - $nodeR)
    $g.FillEllipse($nodeBrush, $nx, $ny, [float]($nodeR * 2), [float]($nodeR * 2))
  }
  $nodeBrush.Dispose()

  # Central glow (violet radial)
  $glowR     = [float]($size * 0.18)
  $glowPath  = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glowPath.AddEllipse($cx - $glowR, $cy - $glowR, $glowR * 2, $glowR * 2)
  $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
  $glowBrush.CenterPoint = New-Object System.Drawing.PointF($cx, $cy)
  $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(255, 167, 139, 250)
  $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 124, 58, 237))
  $g.FillEllipse($glowBrush, $cx - $glowR, $cy - $glowR, $glowR * 2, $glowR * 2)
  $glowBrush.Dispose()

  # Core bright dot
  $coreR     = [float]($size * 0.085)
  $coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 220, 255))
  $g.FillEllipse($coreBrush, $cx - $coreR, $cy - $coreR, $coreR * 2, $coreR * 2)
  $coreBrush.Dispose()

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Created: $path"
}

$dir = 'e:\synepse\extension\icons'
New-Item -ItemType Directory -Force -Path $dir | Out-Null

New-SynapseIcon -size 16  -path "$dir\icon16.png"
New-SynapseIcon -size 48  -path "$dir\icon48.png"
New-SynapseIcon -size 128 -path "$dir\icon128.png"

Write-Host "All icons generated successfully."

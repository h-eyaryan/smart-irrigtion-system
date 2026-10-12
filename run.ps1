# AquaSmart IoT - PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  AquaSmart IoT - Precision Irrigation System" -ForegroundColor Cyan
Write-Host "  With User Auth & AgriBot AI Assistant" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green
Write-Host "`nLaunching web interface in default browser..." -ForegroundColor Yellow

$htmlPath = Join-Path $PSScriptRoot "index.html"
Start-Process $htmlPath

Write-Host "Application launched successfully!" -ForegroundColor Green

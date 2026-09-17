# DEEPTRACE-X: College Expo Workstation PowerShell Launcher

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  DEEPTRACE-X: Adaptive Multi-Signal AI Image Forensics Platform" -ForegroundColor White
Write-Host "  College Expo Live Presentation Mode Launcher (PowerShell)" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

# Add local node.js to path if present
if (Test-Path "$env:LOCALAPPDATA\Programs\nodejs") {
    $env:Path = "$env:LOCALAPPDATA\Programs\nodejs;$env:Path"
}

# 1. Check Python Venv
$PythonExe = Join-Path $RootPath ".venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Host "[ERROR] Virtual environment not found at $PythonExe" -ForegroundColor Red
    Exit 1
}

Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; & '$PythonExe' -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/3] Starting React / Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RootPath\frontend'; npm run dev"

Write-Host "[3/3] Opening Workstation in default browser in 3 seconds..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "DEEPTRACE-X Workstation is active!" -ForegroundColor Cyan
Write-Host "Backend API docs: http://127.0.0.1:8000/docs" -ForegroundColor Gray
Write-Host "Frontend UI:      http://localhost:5173" -ForegroundColor Gray
Write-Host ""

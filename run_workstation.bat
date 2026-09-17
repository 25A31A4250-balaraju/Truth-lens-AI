@echo off
TITLE DEEPTRACE-X Forensic Workstation
echo ===============================================================================
echo   DEEPTRACE-X: Adaptive Multi-Signal AI Image Forensics Platform
echo   College Expo Live Presentation Mode Launcher
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Activating Python Virtual Environment...
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
) else (
    echo [ERROR] Virtual environment not found at .venv\Scripts\activate.bat
    pause
    exit /b 1
)

echo [2/3] Launching FastAPI Backend (Port 8000)...
start "DEEPTRACE-X Backend" cmd /k ".\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Launching Vite/React Frontend (Port 5173)...
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
start "DEEPTRACE-X Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Workstation services initialized successfully!
echo - Backend API:  http://127.0.0.1:8000/docs
echo - Frontend UI:  http://localhost:5173
echo.
echo Opening forensic workstation interface in default browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Press any key to close this launch window (servers will continue running in background).
pause >nul

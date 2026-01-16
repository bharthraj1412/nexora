@echo off
echo ========================================
echo NEXORA - Starting All Services
echo ========================================
echo.

:: Run environment check first
echo Running environment validation...
call check-env.bat
if errorlevel 1 (
    echo.
    echo [ERROR] Environment validation failed!
    echo Please fix the issues above before starting.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting Backend and Frontend...
echo ========================================
echo.

:: Start backend in new window
echo [1/2] Starting backend server...
start "NEXORA Backend" cmd /k "cd /d %~dp0 && start-backend.bat"
echo Backend starting at http://localhost:8000

:: Wait for backend to initialize
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start frontend in new window
echo [2/2] Starting frontend server...
start "NEXORA Frontend" cmd /k "cd /d %~dp0 && start-frontend.bat"
echo Frontend starting at http://localhost:5173

echo.
echo ========================================
echo [SUCCESS] Both services are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Two new windows have opened for backend and frontend.
echo Keep both windows open while using the application.
echo.
echo Press any key to exit this window...
pause >nul

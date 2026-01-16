@echo off
echo ========================================
echo NEXORA - Starting Frontend Server
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "frontend" (
    echo [ERROR] frontend directory not found!
    echo Please run this script from the nexora project root.
    pause
    exit /b 1
)

cd frontend

:: Check if node_modules exists
if not exist "node_modules" (
    echo [ERROR] node_modules not found!
    echo Please run: npm install
    pause
    exit /b 1
)

:: Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

:: Display info
echo.
echo ========================================
echo Frontend starting...
echo ========================================
echo Application: http://localhost:5173
echo Backend API: http://localhost:8000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the development server
npm run dev

@echo off
echo ========================================
echo NEXORA - Starting Backend Server
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "backend" (
    echo [ERROR] backend directory not found!
    echo Please run this script from the nexora project root.
    pause
    exit /b 1
)

cd backend

:: Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then install dependencies: venv\Scripts\activate ^&^& pip install -r requirements.txt
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

:: Activate virtual environment
call venv\Scripts\activate

:: Run environment validation
echo Running environment validation...
python check_env.py
if errorlevel 1 (
    echo.
    echo [WARNING] Environment validation found issues.
    echo The server may not work correctly.
    echo.
)

:: Display info
echo.
echo ========================================
echo Backend starting...
echo ========================================
echo API Server:  http://localhost:8000
echo API Docs:    http://localhost:8000/docs
echo Database:    ./nexora.db
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

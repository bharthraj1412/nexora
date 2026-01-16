@echo off
echo ========================================
echo NEXORA Backend - Clean Reinstall
echo ========================================
echo.
echo This will fix all installation errors:
echo  - Missing Boolean import (FIXED)
echo  - Pydantic Rust compilation (FIXED)
echo.
echo Starting clean installation...
echo.

cd /d "%~dp0"

echo [1/7] Removing old virtual environment...
if exist venv (
    rmdir /s /q venv
    echo   Removed old venv
) else (
    echo   No old venv found
)

echo.
echo [2/7] Creating new virtual environment...
python -m venv venv

echo.
echo [3/7] Activating virtual environment...
call venv\Scripts\activate

echo.
echo [4/7] Upgrading pip...
python -m pip install --upgrade pip --quiet

echo.
echo [5/7] Installing dependencies (this may take 1-2 minutes)...
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo ERROR: Installation failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [6/7] Initializing database...
python -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())"

echo.
echo [7/7] Testing configuration...
python test_config.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Backend is ready!
    echo ========================================
    echo.
    echo Press any key to start the server...
    pause >nul
    
    echo.
    echo Starting NEXORA backend server...
    echo Server will be at: http://localhost:8000
    echo API docs will be at: http://localhost:8000/docs
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    uvicorn app.main:app --reload
) else (
    echo.
    echo ========================================
    echo Configuration test failed
    echo ========================================
    pause
)

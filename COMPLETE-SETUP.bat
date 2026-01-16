@echo off
echo ========================================
echo NEXORA - Complete Setup (All Fixes Applied)
echo ========================================
echo.

echo [Step 1/6] Navigating to backend...
cd /d "%~dp0backend"

echo [Step 2/6] Removing old virtual environment...
if exist venv (
    rmdir /s /q venv
    echo   Old venv removed
)

echo [Step 3/6] Creating fresh virtual environment...
python -m venv venv

echo [Step 4/6] Activating virtual environment...
call venv\Scripts\activate

echo [Step 5/6] Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [Step 6/6] Testing configuration...
python test_config.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Backend is ready!
    echo ========================================
    echo.
    echo To start the server:
    echo   cd backend
    echo   venv\Scripts\activate
    echo   uvicorn app.main:app --reload
    echo.
    echo Press any key to start the server now...
    pause >nul
    
    echo.
    echo Starting backend server...
    uvicorn app.main:app --reload
) else (
    echo.
    echo ========================================
    echo Configuration test failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    pause
)

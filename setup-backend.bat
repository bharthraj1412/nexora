@echo off
echo ========================================
echo NEXORA - Complete Installation Script
echo ========================================
echo.

echo [1/4] Setting up Backend Environment...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate

echo [3/4] Installing backend dependencies...
pip install -r requirements.txt

echo [4/4] Initializing database...
python -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())"

echo.
echo ========================================
echo Backend Setup Complete!
echo ========================================
echo.
echo To start the backend server:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
echo Backend will run at: http://localhost:8000
echo API Docs at: http://localhost:8000/docs
echo.
pause

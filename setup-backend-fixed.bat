@echo off
echo ========================================
echo NEXORA - Backend Setup (FIXED)
echo ========================================
echo.

cd backend

echo [1/5] Removing old virtual environment...
if exist venv (
    rmdir /s /q venv
    echo Old venv removed
)

echo [2/5] Creating new virtual environment...
python -m venv venv

echo [3/5] Activating virtual environment...
call venv\Scripts\activate

echo [4/5] Upgrading pip...
python -m pip install --upgrade pip

echo [5/5] Installing dependencies...
pip install -r requirements.txt

echo.
echo [6/6] Initializing database...
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

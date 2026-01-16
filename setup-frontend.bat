@echo off
echo ========================================
echo NEXORA - Frontend Installation Script
echo ========================================
echo.

cd frontend

echo [1/2] Installing frontend dependencies...
call npm install

echo [2/2] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created! Please configure if needed.
) else (
    echo .env file already exists.
)

echo.
echo ========================================
echo Frontend Setup Complete!
echo ========================================
echo.
echo To start the frontend server:
echo   cd frontend
echo   npm run dev
echo.
echo Frontend will run at: http://localhost:5173
echo.
pause

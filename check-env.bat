@echo off
setlocal enabledelayedexpansion

echo ========================================
echo NEXORA - Environment Validation
echo ========================================
echo.

set "ERRORS=0"

:: Check Python
echo [1/8] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.11+
    set /a ERRORS+=1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VER=%%i
    echo [OK] Python !PYTHON_VER! found
)

:: Check Node.js
echo [2/8] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    set /a ERRORS+=1
) else (
    for /f %%i in ('node --version') do set NODE_VER=%%i
    echo [OK] Node.js !NODE_VER! found
)

:: Check backend virtual environment
echo [3/8] Checking backend virtual environment...
if exist "backend\venv\Scripts\activate.bat" (
    echo [OK] Virtual environment exists
) else (
    echo [WARNING] Virtual environment not found at backend\venv
    echo          Run: cd backend ^&^& python -m venv venv
    set /a ERRORS+=1
)

:: Check backend .env
echo [4/8] Checking backend .env file...
if exist "backend\.env" (
    echo [OK] Backend .env file exists
) else (
    echo [ERROR] Backend .env file not found
    echo          Copy backend\.env.example to backend\.env and configure it
    set /a ERRORS+=1
)

:: Check frontend node_modules
echo [5/8] Checking frontend dependencies...
if exist "frontend\node_modules" (
    echo [OK] Frontend node_modules exists
) else (
    echo [WARNING] Frontend dependencies not installed
    echo          Run: cd frontend ^&^& npm install
    set /a ERRORS+=1
)

:: Check frontend .env
echo [6/8] Checking frontend .env file...
if exist "frontend\.env" (
    echo [OK] Frontend .env file exists
) else (
    echo [ERROR] Frontend .env file not found
    echo          Copy frontend\.env.example to frontend\.env and configure it
    set /a ERRORS+=1
)

:: Check if ports are available
echo [7/8] Checking if port 8000 is available...
netstat -ano | findstr ":8000" >nul 2>&1
if errorlevel 1 (
    echo [OK] Port 8000 is available
) else (
    echo [WARNING] Port 8000 is already in use
    echo          Backend may fail to start
)

echo [8/8] Checking if port 5173 is available...
netstat -ano | findstr ":5173" >nul 2>&1
if errorlevel 1 (
    echo [OK] Port 5173 is available
) else (
    echo [WARNING] Port 5173 is already in use
    echo          Frontend may fail to start
)

echo.
echo ========================================
if !ERRORS! EQU 0 (
    echo [SUCCESS] Environment is ready!
    echo You can now run: start-all.bat
) else (
    echo [FAILED] Found !ERRORS! issue(s)
    echo Please fix the errors above before starting
)
echo ========================================
echo.

endlocal

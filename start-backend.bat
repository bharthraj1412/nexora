@echo off
echo ========================================
echo NEXORA - Starting Backend Server
echo ========================================
echo.

cd backend
call venv\Scripts\activate
echo Backend starting at http://localhost:8000
echo API Docs at http://localhost:8000/docs
echo.
uvicorn app.main:app --reload

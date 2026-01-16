# Environment Setup Guide

This guide explains how to configure the environment for the NEXORA platform.

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run the environment checker:**
   ```bash
   check-env.bat
   ```
   This will verify your setup and tell you what's missing.

2. **Start all services:**
   ```bash
   start-all.bat
   ```
   This will start both backend and frontend in separate windows.

### Option 2: Manual Setup

1. **Start backend only:**
   ```bash
   start-backend.bat
   ```

2. **Start frontend only (in new terminal):**
   ```bash
   start-frontend.bat
   ```

## Environment Files

### Backend Environment (`.env`)

Location: `backend/.env`

**Required Variables:**

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./nexora.db

# Security Keys (generate your own!)
SECRET_KEY=your-secret-key-min-32-characters-long
CSRF_SECRET_KEY=your-csrf-secret-key-min-32-characters
ALGORITHM=HS256

# Token Expiration
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/oauth/google/callback

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@nexora.com
SMTP_FROM_NAME=NEXORA Platform

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**How to generate SECRET_KEY:**
```python
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Frontend Environment (`.env`)

Location: `frontend/.env`

**Required Variables:**

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen
6. Add authorized redirect URIs:
   - `http://localhost:8000/api/v1/auth/oauth/google/callback`
7. Copy Client ID and Client Secret to both backend and frontend `.env` files

## Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `SMTP_PASSWORD`

## Port Requirements

- **Backend:** Port 8000
- **Frontend:** Port 5173

Make sure these ports are not in use by other applications.

## Troubleshooting

### "Port already in use"
- Check what's using the port: `netstat -ano | findstr :8000`
- Kill the process or use a different port

### "Virtual environment not found"
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### "node_modules not found"
```bash
cd frontend
npm install
```

### "Environment validation failed"
Run `check-env.bat` to see specific issues and follow the instructions.

## Security Notes

> [!WARNING]
> - Never commit `.env` files to version control
> - Generate unique SECRET_KEY and CSRF_SECRET_KEY for production
> - Use environment-specific configurations
> - Rotate credentials regularly

## Verification

After setup, verify everything works:

1. **Backend health check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status": "healthy"}`

2. **Frontend access:**
   Open http://localhost:5173 in browser

3. **API documentation:**
   Open http://localhost:8000/docs in browser

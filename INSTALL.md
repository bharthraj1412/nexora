# 🚀 NEXORA - Final Installation Steps

## ✅ All Errors Fixed!

The following issues have been resolved:
1. ✅ Removed invalid `python-cors` package
2. ✅ Fixed Pydantic v2 configuration conflict
3. ✅ Created `.env` file with your credentials
4. ✅ Set `case_sensitive=True` in model_config

---

## 🎯 Fresh Installation (Do This Now)

### Step 1: Clean Backend Installation

Open PowerShell in `g:\projects\nexora\backend` and run:

```powershell
# Remove old venv if exists
Remove-Item -Recurse -Force venv -ErrorAction SilentlyContinue

# Create new virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt

# Initialize database
python -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())"

# Start backend server
uvicorn app.main:app --reload
```

**Backend will start at:** http://localhost:8000

---

### Step 2: Frontend Installation

Open a **NEW PowerShell window** in `g:\projects\nexora\frontend` and run:

```powershell
# Install dependencies
npm install

# Start frontend
npm run dev
```

**Frontend will start at:** http://localhost:5173

---

## ✅ Verification

### Backend Check:
Open in browser: http://localhost:8000/docs

You should see the Swagger API documentation.

### Frontend Check:
Open in browser: http://localhost:5173

You should see the NEXORA login page.

---

## 🎉 Success Indicators

**Backend Terminal:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Frontend Terminal:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 📋 Test the Application

1. **Register:** Go to http://localhost:5173 and click "Sign up"
2. **Enter Details:** Full name, email, password
3. **Check Email:** Look for OTP code (or check backend terminal logs)
4. **Verify:** Enter the 6-digit code
5. **Login:** You're in! Create collections and records

---

## 🔧 If Still Having Issues

### Missing .env file?
The `.env` file is already created at `g:\projects\nexora\backend\.env`

### Pydantic validation error?
Make sure you're in the `backend` directory when running commands and the virtual environment is activated.

### Port already in use?
- Backend (8000): Stop any other FastAPI apps
- Frontend (5173): Stop any other Vite apps

---

All fixes are complete. Just follow the installation steps above! 🚀

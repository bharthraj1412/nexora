# 🎯 START HERE - Get NEXORA Running in 3 Steps

## Step 1: Backend Setup (2 minutes)

### Open PowerShell and run these commands:

```powershell
# Go to backend folder
cd g:\projects\nexora\backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install everything
pip install -r requirements.txt

# Initialize database
python -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())"

# Start backend
uvicorn app.main:app --reload
```

### ✅ You'll see this when it works:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 🌐 Open in browser to verify:
http://localhost:8000/docs

You should see Swagger API documentation!

---

## Step 2: Frontend Setup (1 minute)

### Open a NEW PowerShell window and run:

```powershell
# Go to frontend folder
cd g:\projects\nexora\frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

### ✅ You'll see this when it works:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### 🌐 Open in browser:
http://localhost:5173

You should see the NEXORA login page!

---

## Step 3: Test the App (2 minutes)

1. **Click "Sign up"** on the login page
2. **Enter your details:**
   - Full Name: Your Name
   - Email: your@email.com
   - Password: your_password_here
3. **Click "Continue"**
4. **Check for OTP code:**
   - Look in your backend terminal for a line like:
   ```
   OTP Code: 123456
   ```
   - OR check your email (bh123raj@gmail.com gets all codes)
5. **Enter the OTP code** and click "Verify"
6. **You're in!** Start creating collections!

---

## 🎉 That's It!

Your NEXORA platform is now running with:
- ✅ Backend API on port 8000
- ✅ Frontend UI on port 5173
- ✅ Full authentication working
- ✅ Database ready

---

## 🆘 Quick Troubleshooting

**Backend won't start?**
- Make sure you activated the venv: `.\venv\Scripts\Activate.ps1`
- Check Python version: `python --version` (need 3.11+)

**Frontend won't start?**
- Check Node version: `node --version` (need 18+)
- Try deleting node_modules and run `npm install` again

**Can't find OTP code?**
- Check the backend terminal window
- Lines with "OTP" will show the code

**Port already in use?**
- Backend: Another app is using port 8000
- Frontend: Another app is using port 5173
- Stop those apps or change ports

---

## 📝 Quick Commands Reference

**Start Backend:**
```powershell
cd g:\projects\nexora\backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Start Frontend:**
```powershell
cd g:\projects\nexora\frontend
npm run dev
```

---

## 🎨 What You Can Do

- ✅ Register/Login (3 methods: password, OTP, Google)
- ✅ Create collections (organize your data)
- ✅ Add records (JSON data in collections)
- ✅ View activity logs (audit trail)
- ✅ Toggle dark/light mode
- ✅ Test on mobile (resize browser)

---

**Ready? Start with Step 1 above! 🚀**

Both terminals need to stay open while using the app.

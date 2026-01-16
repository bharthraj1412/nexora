# Deploying NEXORA to Render

This guide explains how to deploy both the backend and frontend of NEXORA to Render.

## 1. Backend Deployment (Web Service)

Create a new **Web Service** on Render and connect your GitHub repository.

### Configuration

| Setting | Value |
|---------|-------|
| **Name** | `nexora-backend` |
| **Runtime** | **Python 3** |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### Environment Variables

Add these in the **Environment** tab:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `DATABASE_URL` | `sqlite+aiosqlite:///./nexora.db` (For simple testing) OR your PostgreSQL URL |
| `SECRET_KEY` | (Generate a strong key) |
| `CSRF_SECRET_KEY` | (Generate a strong key) |
| `FRONTEND_URL` | `https://your-frontend-app.onrender.com` (Update after deploying frontend) |
| `...` | (Add all other variables from `.env`) |

> [!NOTE]
> SQLite will lose data on every restart/deploy on Render's free tier. For persistent data, use a **Render PostgreSQL** database and update `DATABASE_URL` to point to it (replace `postgres://` with `postgresql+asyncpg://`).

---

## 2. Frontend Deployment (Static Site)

Create a new **Static Site** on Render and connect the same repository.

### Configuration

| Setting | Value |
|---------|-------|
| **Name** | `nexora-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install; npm run build` |
| **Publish Directory** | `dist` |

### Environment Variables

Add these in the **Environment** tab:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://nexora-backend.onrender.com` (Your backend URL) |
| `VITE_GOOGLE_CLIENT_ID` | (Your Google Client ID) |

---

## 3. Final Steps

1. Get the **Backend URL** (e.g., `https://nexora-backend.onrender.com`).
2. Update the frontend's `VITE_API_URL` environment variable with this URL.
3. Redeploy the frontend.
4. Get the **Frontend URL** (e.g., `https://nexora-frontend.onrender.com`).
5. Update the backend's `FRONTEND_URL` environment variable with this URL.
6. Update your **Google OAuth Console** to allow the new frontend URL and redirect URI.
   - Redirect URI: `https://nexora-backend.onrender.com/api/v1/auth/oauth/google/callback`

## Summary of Commands

### Backend
**Root Directory:** `backend`

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend
**Root Directory:** `frontend`

**Build Command:**
```bash
npm install; npm run build
```

**Publish Directory:**
```
dist
```

## ⚠️ Troubleshooting

**Error: `Could not open requirements file: ... No such file or directory: 'requirements.txt'`**

This means Render is looking for the file in the wrong folder. You have two options:

**Option A (Recommended):**
1. Go to **Settings** in Render dashboard.
2. Find **Root Directory**.
3. Set it to `backend` (for backend service) or `frontend` (for static site).
4. Save Changes.

**Option B (Alternate Command):**
If you cannot change the Root Directory, use these commands instead:

**Backend:**
- Build: `pip install -r backend/requirements.txt`
- Start: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`

**Frontend:**
- Build: `cd frontend && npm install && npm run build`

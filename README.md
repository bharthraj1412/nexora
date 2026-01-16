# NEXORA - Digital Workspace Platform

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)

NEXORA is a production-grade digital workspace platform featuring enterprise-level authentication, secure data management, and a modern responsive UI.

## ✨ Features

| Category | Features |
|----------|----------|
| **Authentication** | 🔐 Email/Password, OTP, Google OAuth2, JWT with Refresh Tokens |
| **Data Management** | 📊 Custom Collections, Dynamic Records, Excel/CSV Import |
| **Security** | 🛡️ CSRF Protection, Rate Limiting, Audit Logging, Input Validation |
| **Internal Tools** | 🚀 Automated Workflow Builders, Conflict Detection |
| **UI/UX** | 🎨 Dark/Light Mode, Responsive Design, Real-time Feedback |

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1-Click Startup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bharthraj1412/nexora.git
   cd nexora
   ```

2. **Setup environment:**
   *(First time only - see [ENV-SETUP.md](ENV-SETUP.md) for details)*
   ```bash
   check-env.bat  # Validates your setup
   ```

3. **Run everything:**
   ```bash
   start-all.bat
   ```
   This command launches both Backend (http://localhost:8000) and Frontend (http://localhost:5173).

---

## ☁️ Deployment

### Deploy to Render

We have optimized NEXORA for easy deployment on [Render](https://render.com).

👉 **[Read the Deployment Guide](DEPLOY-TO-RENDER.md)**

**Quick Config:**
- **Backend:** Python 3 • Root: `backend` • Build: `pip install -r requirements.txt` • Start: `uvicorn app.main:app...`
- **Frontend:** Static Site • Root: `frontend` • Build: `npm install; npm run build` • Dist: `dist`

---

## 📚 Documentation Index

- **[START.md](START.md)** - Step-by-step getting started guide (Manual setup)
- **[ENV-SETUP.md](ENV-SETUP.md)** - Detailed environment variable configuration
- **[DEPLOY-TO-RENDER.md](DEPLOY-TO-RENDER.md)** - Production deployment instructions
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete implementation details
- **[STRUCTURE.md](STRUCTURE.md)** - Architecture and folder structure

## 🛠️ Project Structure

```
nexora/
├── backend/            # FastAPI Application
│   ├── app/            # Source code
│   ├── alembic/        # Database migrations
│   └── requirements.txt
│
├── frontend/           # React Application
│   ├── src/            # Components & Logic
│   └── package.json
│
├── start-all.bat       # Unified startup script
├── check-env.bat       # Environment validator
└── README.md           # This file
```

## 🔧 Tech Stack

**Backend:**
- FastAPI (Async Web Framework)
- SQLAlchemy 2.0 (Async ORM)
- Alembic (Migrations)
- Pydantic v2 (Validation)

**Frontend:**
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- Zustand (State Management)

## 🤝 Contributing

Contributions are welcome! Please run `check-env.bat` before submitting a PR to ensure your environment is correctly configured.

## 📝 License

This project is licensed under the MIT License.

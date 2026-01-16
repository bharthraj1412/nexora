# NEXORA - Quick Reference

## 📁 Important Files

**To Get Started:**
- 👉 **RUN-NOW.md** ⭐ - Ultra-simple 2-step guide
- **FINAL-FIX.md** - What was fixed and how
- **backend/INSTALL-CLEAN.bat** - Automated backend install

**Detailed Guides:**
- **START.md** - 3-step getting started
- **INSTALL.md** - Full installation guide
- **INDEX.md** - Complete documentation index

---

# NEXORA - Digital Workspace Platform

Production-grade digital workspace platform with enterprise-level authentication and secure data management.

## ✨ Features

- 🔐 **Enterprise Authentication** - Email/password, OTP, and Google OAuth
- 📊 **Collections & Records** - Organize and manage your data
- 🎨 **Modern UI** - Beautiful, responsive interface with dark mode
- 🔒 **Security First** - JWT tokens, CSRF protection, audit logging
- 📱 **Mobile Ready** - Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Setup & Run (3 Steps)

1. **Clone and navigate:**
   ```bash
   git clone https://github.com/bharthraj1412/nexora.git
   cd nexora
   ```

2. **Setup environment:**
   ```bash
   # Backend
   cd backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On Linux/Mac
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your credentials (see ENV-SETUP.md)
   cd ..

   # Frontend
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   cd ..
   ```

3. **Start everything:**
   ```bash
   start-all.bat  # On Windows
   # Or manually: start-backend.bat and start-frontend.bat in separate terminals
   ```

**That's it!** 🎉

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📚 Documentation

- **[ENV-SETUP.md](ENV-SETUP.md)** - Detailed environment configuration guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup and implementation guide
- **[START.md](START.md)** - Step-by-step getting started guide
- **[STRUCTURE.md](STRUCTURE.md)** - Project structure and architecture

## 🛠️ Development

### Individual Services

**Backend only:**
```bash
start-backend.bat
```

**Frontend only:**
```bash
start-frontend.bat
```

### Environment Validation

Check if your environment is properly configured:
```bash
check-env.bat
```

## 🔧 Tech Stack

**Backend:**
- FastAPI (async Python web framework)
- SQLAlchemy 2.0 (async ORM)
- Alembic (database migrations)
- Pydantic v2 (data validation)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

## 📊 Project Status

- **Backend:** 100% Complete ✅
- **Frontend:** 100% Complete ✅
- **All Errors:** Fixed ✅
- **Ready to Run:** YES ✅

---

**Everything is ready. Just follow RUN-NOW.md! 🎉**

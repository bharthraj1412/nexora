# 🗺️ NEXORA - Visual Structure Guide

## Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                   NEXORA Platform                        │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐      │
│  │   Login    │  │  Register  │  │  OTP Login   │      │
│  │   Page     │  │   + OTP    │  │ Passwordless │      │
│  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘      │
│        │               │                 │              │
│        └───────────┬───┴─────────────────┘              │
│                    │                                     │
│                    ▼                                     │
│         ┌──────────────────────┐                        │
│         │   Main Application   │                        │
│         │   (Protected Area)   │                        │
│         └──────────┬───────────┘                        │
│                    │                                     │
│         ┌──────────┴──────────┐                         │
│         │                     │                         │
│    ┌────▼────┐          ┌────▼────┐                    │
│    │ Sidebar │          │ Header  │                    │
│    │  Menu   │          │ + Theme │                    │
│    └────┬────┘          └─────────┘                    │
│         │                                               │
│    ┌────▼──────────────────────────────┐               │
│    │          Page Content             │               │
│    │                                   │               │
│    │  • Dashboard (Stats + Activity)  │               │
│    │  • Collections (Grid + CRUD)     │               │
│    │  • Collection Detail (Records)   │               │
│    │  • Activity Logs (Timeline)      │               │
│    │  • Pricing (Tiers)               │               │
│    └───────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.tsx (Router + Auth Check)
│
├── Auth Pages (Unprotected)
│   ├── LoginPage
│   │   └── Input, Button
│   ├── RegisterPage
│   │   └── Input, Button (2 steps)
│   └── OTPLoginPage
│       └── Input, Button (2 steps)
│
└── MainLayout (Protected)
    ├── Sidebar
    │   └── Navigation Links
    ├── Header
    │   ├── User Menu (Dropdown)
    │   └── Theme Toggle
    └── Outlet (Page Content)
        ├── DashboardPage
        │   ├── Stats Cards
        │   ├── Recent Collections
        │   └── Recent Activity
        ├── CollectionsPage
        │   ├── Collection Grid
        │   ├── Modal (Create/Edit)
        │   └── EmptyState
        ├── CollectionDetailPage
        │   ├── Records Table
        │   ├── Modal (JSON Editor)
        │   └── EmptyState
        ├── ActivityPage
        │   ├── Filters
        │   ├── Activity List
        │   └── EmptyState
        └── PricingPage
            └── Pricing Cards (3 tiers)
```

---

## State Management Flow

```
┌─────────────────────────────────────────┐
│          Zustand Stores                 │
├─────────────────────────────────────────┤
│                                         │
│  authStore                              │
│  ├── user: User | null                  │
│  ├── isAuthenticated: boolean           │
│  ├── login()                            │
│  ├── register() → requestOTP()          │
│  ├── verifyOTP()                        │
│  ├── logout()                           │
│  └── checkAuth()                        │
│                                         │
│  collectionStore                        │
│  ├── collections: Collection[]          │
│  ├── records: Record[]                  │
│  ├── fetchCollections()                 │
│  ├── createCollection()                 │
│  ├── updateCollection()                 │
│  ├── deleteCollection()                 │
│  ├── fetchRecords()                     │
│  ├── createRecord()                     │
│  ├── updateRecord()                     │
│  └── deleteRecord()                     │
│                                         │
│  themeStore                             │
│  ├── isDark: boolean                    │
│  └── toggleTheme()                      │
│      (persisted to localStorage)        │
└─────────────────────────────────────────┘
```

---

## API Integration

```
Frontend                Backend API
────────────────────────────────────────
                        
api.ts (Axios)  ──────► FastAPI
│                       │
├── Request             ├── /api/v1/auth/*
│   ├── Add token       ├── /api/v1/collections/*
│   └── Set headers     ├── /api/v1/records/*
│                       └── /api/v1/activity
├── Response            
│   ├── Success ────────► Update Store
│   └── 401 Error       
│       └── Refresh Token
│           ├── Success ──► Retry Request
│           └── Fail ────► Redirect to Login
│
└── Toast Notification
```

---

## Authentication Flow (Detailed)

### Email/Password Registration
```
User Action          Frontend              Backend
─────────────────────────────────────────────────
Enter Details    →  RegisterPage
Click Continue   →  requestOTP()      →  POST /auth/register/request-otp
                                       ← OTP sent to email
                                       ← 200 OK
Enter OTP        →  Step 2
Click Verify     →  verifyOTP()       →  POST /auth/register/verify
                                       ← Create user
                                       ← Generate tokens
                                       ← 200 OK + tokens
Store Tokens     ←  authStore
Redirect         →  Dashboard
```

### Email/Password Login
```
User Action          Frontend              Backend
─────────────────────────────────────────────────
Enter Credentials →  LoginPage
Click Sign In     →  login()           →  POST /auth/login
                                       ← Verify password
                                       ← Generate tokens
                                       ← 200 OK + tokens
Store Tokens      ←  authStore
Redirect          →  Dashboard
```

### Token Refresh (Automatic)
```
Request Fails (401) → api.ts interceptor
                   → POST /auth/refresh
                   ← New tokens
Update Storage     → localStorage
Retry Request      → Original API call
```

---

## Data Flow Example: Create Collection

```
User clicks       Pages/              Store/              API/             Backend
"New Collection"  CollectionsPage     collectionStore     api.ts           FastAPI
──────────────────────────────────────────────────────────────────────────────────

1. Click button → Open Modal
                    
2. Enter name   → Form state
   + description

3. Click Create → Submit form
                → createCollection() → POST request   → /collections
                                     → Add auth token  
                                                       ← Validate
                                                       ← Create in DB
                                                       ← Log activity
                                                       ← 201 Created
                ← Update collections array
                  
4. Close modal  ← Success toast
                  
5. See new      ← Re-render with
   collection      new data
```

---

## File Organization

```
frontend/src/
│
├── components/          # Reusable UI
│   ├── layout/         # App structure
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── ui/             # Base components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       └── LoadingSpinner.tsx
│
├── pages/              # Route pages
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── OTPLoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CollectionsPage.tsx
│   ├── CollectionDetailPage.tsx
│   ├── ActivityPage.tsx
│   └── PricingPage.tsx
│
├── store/              # State management
│   ├── authStore.ts
│   ├── collectionStore.ts
│   └── themeStore.ts
│
├── types/              # TypeScript types
│   └── index.ts
│
├── utils/              # Helpers
│   ├── api.ts          # Axios client
│   └── format.ts       # Formatters
│
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

---

## Routing Structure

```
/
├── /login                  → LoginPage
├── /register               → RegisterPage
├── /otp-login             → OTPLoginPage
│
└── / (Protected)          → MainLayout
    ├── /dashboard          → DashboardPage
    ├── /collections        → CollectionsPage
    ├── /collections/:id    → CollectionDetailPage
    ├── /activity           → ActivityPage
    └── /pricing            → PricingPage
```

---

## Security Layers

```
┌──────────────────────────────────────────┐
│           Security Stack                 │
├──────────────────────────────────────────┤
│                                          │
│  Frontend                                │
│  ├── JWT validation before requests      │
│  ├── Token refresh on 401               │
│  ├── Route protection (auth check)      │
│  ├── Form validation                    │
│  └── XSS protection (React escaping)    │
│                                          │
│  Network                                 │
│  ├── HTTPS (production)                 │
│  ├── CORS (frontend origin only)        │
│  └── HTTP-only cookies                  │
│                                          │
│  Backend                                 │
│  ├── Argon2 password hashing            │
│  ├── JWT verification per request       │
│  ├── CSRF token validation              │
│  ├── Rate limiting                      │
│  ├── Account lockout                    │
│  ├── OTP hashing (SHA-256)               │
│  ├── Ownership enforcement              │
│  └── Activity logging                   │
│                                          │
│  Database                                │
│  ├── SQL injection prevention (ORM)     │
│  ├── Soft deletes                       │
│  └── Timestamps for audit               │
└──────────────────────────────────────────┘
```

---

## Design System

```
Colors                Typography              Spacing
──────────────────────────────────────────────────────
Primary: Indigo       Font: Inter             Unit: 4px
Secondary: Purple     Heading: Bold 24-48px   
Success: Green        Body: Regular 14-16px   Common:
Danger: Red           Small: 12-13px          - p-2: 8px
                                              - p-4: 16px
Dark Mode Support     Animations              - p-6: 24px
- Light backgrounds   - Fade-in: 300ms        - p-8: 32px
- Dark backgrounds    - Slide-up: 300ms
- Auto contrast       - Smooth: 200ms         Border Radius
                                              - rounded-lg: 12px
                                              - rounded-xl: 16px
```

---

## Performance Optimizations

```
✅ Code Splitting       → Automatic by Vite
✅ Lazy Loading        → Route-based loading
✅ Tree Shaking        → Unused code removed
✅ Minification        → Production builds
✅ Image Optimization  → Modern formats
✅ CSS Purging         → Tailwind JIT
✅ Bundle Analysis     → Available via tools
```

---

This is your complete NEXORA platform - ready to launch! 🚀

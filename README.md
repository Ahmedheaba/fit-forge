# 🏋️ FitForge — Full-Stack Gym Management App

A premium, fully-responsive gym web application built with **Node.js + Express** (backend) and **React + Vite** (frontend). Features Google OAuth, booking management, membership plans, admin dashboard with analytics, and email notifications.

---

## 📁 Project Structure

```
gym-app/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── email.js            # Nodemailer email templates
│   ├── controllers/
│   │   ├── authController.js   # Register, login, Google OAuth
│   │   ├── bookingController.js# Create, cancel, view bookings
│   │   ├── planController.js   # Membership plan CRUD
│   │   └── adminController.js  # Admin dashboard & analytics
│   ├── middleware/
│   │   └── auth.js             # JWT verification, role guard
│   ├── models/
│   │   ├── User.js             # User schema (Google + local)
│   │   ├── Plan.js             # Membership plans
│   │   ├── GymClass.js         # Class schedule schema
│   │   └── Booking.js          # Booking with double-book prevention
│   ├── routes/
│   │   ├── auth.js             # /api/auth/*
│   │   ├── users.js            # /api/users/*
│   │   ├── plans.js            # /api/plans/*
│   │   ├── bookings.js         # /api/bookings/*
│   │   ├── classes.js          # /api/classes/*
│   │   └── admin.js            # /api/admin/*
│   ├── scripts/
│   │   └── seed.js             # DB seed: plans, classes, admin user
│   ├── server.js               # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                   # React + Vite SPA
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Navbar.jsx  # Responsive nav with auth state
    │   │       └── Footer.jsx  # Footer with links and contact
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state (JWT + Google)
    │   ├── pages/
    │   │   ├── HomePage.jsx    # Landing: Hero, Features, Classes, Trainers, Testimonials, CTA, Contact
    │   │   ├── LoginPage.jsx   # Email + Google OAuth login
    │   │   ├── RegisterPage.jsx# Registration with password strength
    │   │   ├── PlansPage.jsx   # Pricing with subscribe flow
    │   │   ├── BookPage.jsx    # Class booking with calendar + time slots
    │   │   ├── DashboardPage.jsx # User bookings & subscription
    │   │   ├── ProfilePage.jsx # Profile, security, notifications
    │   │   ├── AdminPage.jsx   # Full admin: dashboard, users, bookings, plans, classes
    │   │   └── NotFoundPage.jsx
    │   ├── utils/
    │   │   └── api.js          # Axios instance with interceptors
    │   ├── App.jsx             # Router + route guards
    │   ├── main.jsx            # React entry point
    │   └── index.css           # Tailwind + custom CSS
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## ✅ Features

| Feature | Status |
|---|---|
| Local email/password auth | ✅ |
| Google OAuth (One Tap) | ✅ |
| JWT session management | ✅ |
| Role-based access (Admin/Customer) | ✅ |
| View membership plans | ✅ |
| Subscribe to plans | ✅ |
| Book gym classes / open gym | ✅ |
| Double-booking prevention | ✅ |
| Monthly booking limits per plan | ✅ |
| Cancel bookings (2hr policy) | ✅ |
| Booking confirmation emails | ✅ |
| Cancellation emails | ✅ |
| Welcome email on register | ✅ |
| User dashboard | ✅ |
| Profile management | ✅ |
| Password change | ✅ |
| Notification preferences | ✅ |
| Admin dashboard with analytics | ✅ |
| Monthly booking trend chart | ✅ |
| Popular classes chart | ✅ |
| Admin: manage users | ✅ |
| Admin: manage bookings | ✅ |
| Admin: CRUD membership plans | ✅ |
| Admin: CRUD gym classes | ✅ |
| Dark mode (default) | ✅ |
| Fully responsive (mobile-first) | ✅ |
| Rate limiting & security headers | ✅ |
| SEO meta tags | ✅ |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- A [Google Cloud Console](https://console.cloud.google.com) project with OAuth credentials

---

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/your-username/fitforge.git
cd fitforge

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 2. Configure Environment Variables

**Backend** (`backend/.env`):

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/fitforge
# Or Atlas: mongodb+srv://<user>:<pass>@cluster.mongodb.net/fitforge

# JWT
JWT_SECRET=change_this_to_a_random_64_char_string
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=FitForge <noreply@fitforge.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# First user with this email becomes admin
ADMIN_EMAIL=admin@fitforge.com
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
```

---

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable **Google+ API** and **Google Identity API**
3. Go to **Credentials** → **Create OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://yourdomain.com`
6. Authorized redirect URIs:
   - `http://localhost:3000`
   - `https://yourdomain.com`
7. Copy **Client ID** to both `.env` files

---

### 4. Seed the Database

```bash
cd backend
node scripts/seed.js
```

This creates:
- 4 membership plans (Starter, Pro, Elite Annual, Personal Training)
- 8 gym classes with full schedules
- Admin user: `admin@fitforge.com` / `Admin@123`

---

### 5. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🛡️ API Reference

### Auth Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register with email/password |
| POST | `/api/auth/login` | — | Login with email/password |
| POST | `/api/auth/google` | — | Google OAuth token exchange |
| GET | `/api/auth/me` | JWT | Get current user |

### Plans
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/plans` | — | Get all active plans |
| POST | `/api/plans` | Admin | Create plan |
| PUT | `/api/plans/:id` | Admin | Update plan |
| DELETE | `/api/plans/:id` | Admin | Deactivate plan |
| POST | `/api/plans/:id/subscribe` | JWT | Subscribe to plan |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | JWT | Get my bookings |
| POST | `/api/bookings` | JWT | Create booking |
| GET | `/api/bookings/:id` | JWT | Get single booking |
| PATCH | `/api/bookings/:id/cancel` | JWT | Cancel booking |
| GET | `/api/bookings/availability/:classId` | JWT | Check slot availability |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Stats + analytics |
| GET | `/api/admin/users` | Admin | All users with filters |
| PATCH | `/api/admin/users/:id` | Admin | Update user (role, status) |
| GET | `/api/admin/bookings` | Admin | All bookings |
| PATCH | `/api/admin/bookings/:id` | Admin | Update booking status |

---

## 🌐 Deployment

### Option A: Render (Recommended — Free Tier)

**Backend on Render:**
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `backend/.env`
7. Set `NODE_ENV=production`

**Frontend on Render:**
1. Create a new **Static Site**
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add `VITE_API_URL=https://your-backend.onrender.com/api`
6. Add `VITE_GOOGLE_CLIENT_ID=your_client_id`

---

### Option B: Vercel + Render

**Frontend → Vercel:**
```bash
cd frontend
npm install -g vercel
vercel --prod
# Set env vars in Vercel dashboard
```

**Backend → Render** (same steps as above)

---

### Option C: VPS / DigitalOcean

```bash
# On your server
git clone https://github.com/your-username/fitforge.git
cd fitforge

# Backend
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm install -g pm2
pm2 start server.js --name fitforge-api

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env
npm install
npm run build
# Serve with Nginx (see below)
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/fitforge/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Option D: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

---

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use that 16-character password as `EMAIL_PASS` in `.env`

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| Auth | JWT + Google OAuth (`@react-oauth/google`) |
| Charts | Recharts |
| HTTP | Axios |
| Animations | Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth Guard | bcryptjs, jsonwebtoken |
| Google OAuth | `google-auth-library` |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, CORS |
| Validation | express-validator |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#39FF14` (Neon Green) |
| Accent | `#FF6B00` (Orange) |
| Background | `#000000` |
| Surface | `#1a1a1a` |
| Border | `rgba(255,255,255,0.05)` |
| Font Display | Bebas Neue |
| Font Body | DM Sans |
| Font Mono | JetBrains Mono |

---

## 🧪 Testing the App

After running `node scripts/seed.js`:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | admin@fitforge.com | Admin@123 | Admin |

**Customer flow:**
1. Register a new account at `/register`
2. Browse plans at `/plans` → Subscribe
3. Book a class at `/book`
4. View bookings at `/dashboard`

**Admin flow:**
1. Login as admin
2. Visit `/admin`
3. Check dashboard analytics
4. Manage users, bookings, plans, classes

---

## 📄 License

MIT License — free to use for personal and commercial projects.

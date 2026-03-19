# 🏠 CampuStay v3 — Student Housing Platform

A complete full-stack student housing platform with premium dark UI, animations, and all features.

---

## 📁 Project Structure

```
campustay/
├── frontend/
│   ├── index.html                  ← Landing page (hero, features, pricing, footer)
│   ├── css/main.css                ← Complete design system (dark theme, amber accent)
│   ├── js/
│   │   ├── main.js                 ← Shared utilities, auth, demo data
│   │   ├── student.js              ← Student dashboard logic
│   │   ├── owner.js                ← Owner dashboard logic
│   │   └── admin.js                ← Admin dashboard + charts
│   └── pages/
│       ├── login.html              ← Login (role selection + demo mode)
│       ├── signup.html             ← Signup
│       ├── student-dashboard.html  ← Browse, map, roommate survey, bookings
│       ├── owner-dashboard.html    ← Manage listings, booking requests, earnings
│       └── admin-dashboard.html    ← Platform overview, approvals, reports
├── backend/
│   ├── server.js                   ← Express entry point
│   ├── .env.example                ← Environment variables template
│   ├── controllers/                ← Auth, Property, Booking, Roommate, Admin
│   ├── middleware/auth.js          ← JWT authentication middleware
│   ├── models/                     ← Mongoose models (User, Property, Booking, etc.)
│   └── routes/                     ← REST API routes
└── database/seed.js                ← Sample data seeder
```

---

## 🚀 Quick Start (Demo Mode)

**Open without any backend — works 100% in browser:**

1. Open `frontend/index.html` in your browser (or use Live Server in VS Code)
2. Click **Get Started** → **Login**
3. Use the demo buttons:
   - 🎓 **Student** — Browse properties, map, roommate survey, bookings
   - 🏠 **Owner** — Manage listings, booking requests, earnings
   - ⚙️ **Admin** — Platform overview, approve properties, charts

---

## 🔌 Full Backend Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env:
```
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/campustay
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://127.0.0.1:5500
```

### 3. Seed the database
```bash
cd database
node seed.js
```

### 4. Start the server
```bash
cd backend
npm start
# or for development:
npm run dev
```

### 5. Open frontend
Use **VS Code Live Server** (port 5500) or any static server.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Font | Clash Display (headings) + Satoshi (body) |
| Background | `#0c0c10` |
| Surface | `#1e1e2a` |
| Accent | `#f59e0b` (amber) |
| Accent 2 | `#fb923c` (orange) |
| Teal | `#2dd4bf` |
| Text | `#f0f0f5` |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | ananya@student.com | demo123 |
| Owner | priya@owner.com | demo123 |
| Admin | admin@campustay.com | demo123 |

---

## 🌟 Features

### Student
- 🔍 Browse & filter 6 demo properties
- 🗺️ Interactive Leaflet map with price markers
- 🤝 6-step roommate compatibility survey
- 📋 Booking requests (view status, cancel)
- ❤️ Save favorite properties

### Owner
- 🏘️ Manage property listings
- ➕ Add / edit / delete properties
- 📋 Approve or decline booking requests
- 💰 Earnings overview with transaction history

### Admin
- 📊 Platform metrics (users, properties, bookings)
- 📈 Interactive Chart.js charts (bar, doughnut, line)
- ✅ Approve pending property listings
- 👥 View and manage all users
- 📋 Monitor all platform bookings

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/properties` | — | List approved properties |
| POST | `/api/properties` | Owner | Create listing |
| PUT | `/api/properties/:id` | Owner | Update listing |
| DELETE | `/api/properties/:id` | Owner/Admin | Delete listing |
| GET | `/api/bookings/mine` | Student | My bookings |
| POST | `/api/bookings` | Student | Create booking |
| PUT | `/api/bookings/:id/respond` | Owner | Approve/decline |
| GET | `/api/admin/stats` | Admin | Platform stats |
| PUT | `/api/admin/properties/:id/approve` | Admin | Approve listing |

---

## 🛠️ Tech Stack

**Frontend:** HTML5 · CSS3 · Vanilla JS · Leaflet.js · Chart.js  
**Backend:** Node.js · Express.js · Mongoose · JWT · bcrypt  
**Database:** MongoDB

---

Built with ❤️ for students across India

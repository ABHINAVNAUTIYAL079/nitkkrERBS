# NIT KKR E-Rickshaw Booking System

A full-stack campus e-rickshaw booking platform built with **React (Vite)**, **Express.js**, **Tailwind CSS**, **MongoDB Atlas**, and **JWT authentication**.

---

## ✨ Features

- **Student**: Book rides instantly without login, track booking history by phone number, cancel pending rides
- **Driver**: Secure login, view pending bookings, accept rides, update status (on_the_way / completed), toggle availability  
- **Admin**: Full dashboard — view all bookings with filters, add/approve/suspend drivers, reset passwords
- **Security**: bcrypt password hashing, JWT stored in HTTP-only cookies, role-based route protection via Express middleware

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works fine)

### 2. Clone & Install

```bash
cd nitkkrERBS

# Install root dependencies (concurrently)
npm install

# Install client & server dependencies
npm install --prefix client
npm install --prefix server
```

Or install everything at once:
```bash
npm run install:all
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/erickshaw
JWT_SECRET=your_very_secure_secret_here
PORT=5000
VITE_APP_URL=http://localhost:5173
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 4. Run Development Server

```bash
npm run dev
```

This starts both:
- **Client** (Vite) at [http://localhost:5173](http://localhost:5173)
- **Server** (Express) at [http://localhost:5000](http://localhost:5000)

The Vite dev server proxies `/api` requests to the Express backend automatically.

---

## 📁 Project Structure

```
nitkkrERBS/
├── client/                         # React (Vite) frontend
│   ├── public/                     # Static assets (logo, images)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── TrackingMap.jsx
│   │   │   ├── KurukshetraMap.jsx
│   │   │   ├── LocationSearch.jsx
│   │   │   ├── CaptchaWidget.jsx
│   │   │   ├── ThemeProvider.jsx
│   │   │   ├── ThemeBackground.jsx
│   │   │   ├── Typewriter.jsx
│   │   │   └── ui.jsx              # Spinner, StatusBadge
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterUserPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BookingConfirmPage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   ├── TrackingPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── DriverRegisterPage.jsx
│   │   │   ├── DriverDashboardPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── AdminDriversPage.jsx
│   │   ├── lib/
│   │   │   └── fareUtils.js
│   │   ├── App.jsx                 # React Router routes
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Tailwind + custom styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                         # Express.js backend
│   ├── routes/
│   │   ├── authUser.js
│   │   ├── authDriver.js
│   │   ├── authAdmin.js
│   │   ├── authCommon.js
│   │   ├── bookings.js
│   │   ├── adminDrivers.js
│   │   ├── driver.js
│   │   └── tracking.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Booking.js
│   │   ├── Driver.js
│   │   ├── Location.js
│   │   ├── Otp.js
│   │   └── User.js
│   ├── lib/
│   │   ├── db.js                   # Mongoose connection
│   │   ├── jwt.js                  # JWT sign/verify
│   │   ├── auth.js                 # bcrypt helpers
│   │   ├── email.js                # Nodemailer
│   │   ├── distance.js             # Haversine distance
│   │   └── fareUtils.js            # Fare calculation
│   ├── middleware/
│   │   └── auth.js                 # JWT auth middleware
│   ├── server.js                   # Express entry point
│   └── package.json
├── .env.example
├── .gitignore
├── package.json                    # Root monorepo scripts
└── README.md
```

---

## 🔐 Default Credentials (after seeding)

| Role  | Credential                        | Password  |
|-------|-----------------------------------|-----------|
| Admin | admin@nitkkr.ac.in                | admin123  |
| Driver| (set via admin panel)             | (set via admin panel) |

---

## 📊 Booking Lifecycle

```
pending → accepted → on_the_way → completed
                ↘ cancelled (before acceptance only)
```

---

## 🌐 Deployment

### Option A: Separate Hosting
1. **Server**: Deploy `server/` to Railway, Render, or any Node.js host
2. **Client**: Deploy `client/` to Vercel, Netlify, or any static host
3. Set `VITE_APP_URL` in server `.env` to client domain
4. Update client's Vite proxy or API base URL to point to server

### Option B: Single Server
1. Build client: `cd client && npm run build`
2. Serve `client/dist` as static files from Express
3. Deploy the combined app to Railway, Render, etc.

---

## 🛠️ Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18 (Vite)              |
| Backend    | Express.js                    |
| Styling    | Tailwind CSS                  |
| Routing    | React Router DOM v6           |
| Database   | MongoDB Atlas + Mongoose      |
| Auth       | JWT + bcryptjs                |
| Maps       | Google Maps API / Leaflet     |
| Icons      | Lucide React                  |
| Toast      | React Hot Toast               |

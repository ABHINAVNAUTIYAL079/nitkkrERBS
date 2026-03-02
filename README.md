# NIT KKR E-Rickshaw Booking System

A full-stack campus e-rickshaw booking platform built with **Next.js 14 App Router**, **Tailwind CSS**, **MongoDB Atlas**, and **JWT authentication**.

---

## ✨ Features

- **Student**: Book rides instantly without login, track booking history by phone number, cancel pending rides
- **Driver**: Secure login, view pending bookings, accept rides, update status (on_the_way / completed), toggle availability  
- **Admin**: Full dashboard — view all bookings with filters, add/approve/suspend drivers, reset passwords
- **Security**: bcrypt password hashing, JWT stored in HTTP-only cookies, role-based route protection via Next.js middleware

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works fine)

### 2. Clone & Install

```bash
cd E-Rickshaw
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/erickshaw
JWT_SECRET=your_very_secure_secret_here
```

### 4. Seed Database

```bash
npm run seed
```

This will:
- Insert 16 NIT KKR campus locations
- Create default admin account: `admin@nitkkr.ac.in` / `admin123`

> ⚠️ Change the admin password immediately in production!

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
E-Rickshaw/
├── app/
│   ├── page.tsx                    # Student landing + booking form
│   ├── booking-confirm/page.tsx    # Booking confirmation
│   ├── bookings/page.tsx           # Student booking history
│   ├── driver/
│   │   ├── login/page.tsx
│   │   └── dashboard/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx      # All bookings + stats
│   │   └── drivers/page.tsx        # Driver management
│   └── api/
│       ├── auth/admin/login/
│       ├── auth/driver/login/
│       ├── auth/logout/
│       ├── auth/me/
│       ├── bookings/
│       ├── bookings/[id]/
│       ├── bookings/pending/
│       ├── admin/drivers/
│       ├── admin/drivers/[id]/
│       ├── admin/drivers/[id]/reset-password/
│       ├── driver/availability/
│       └── locations/
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ui.tsx                      # Spinner, StatusBadge, PageLoader
├── lib/
│   ├── db.ts                       # Mongoose singleton
│   ├── jwt.ts                      # JWT sign/verify
│   ├── auth.ts                     # bcrypt helpers
│   └── getUser.ts                  # Extract user from cookie
├── models/
│   ├── Admin.ts
│   ├── Driver.ts
│   ├── Booking.ts
│   └── Location.ts
├── middleware.ts                   # Route protection
├── scripts/seed.ts
└── .env.example
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

## 🌐 Deployment (Vercel)

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy — Vercel auto-detects Next.js

---

## 🛠️ Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Framework  | Next.js 14 (App Router)       |
| Styling    | Tailwind CSS                  |
| Database   | MongoDB Atlas + Mongoose      |
| Auth       | JWT + bcryptjs                |
| Icons      | Lucide React                  |
| Toast      | React Hot Toast               |

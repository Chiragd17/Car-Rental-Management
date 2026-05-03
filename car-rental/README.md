# DriveElite — Premium Car Rental Frontend

A production-ready React frontend for an online car rental system.

## Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS** (Playfair Display + DM Sans fonts)
- **React Router v6**
- **Axios** (API calls with auth headers)
- **Supabase JS** (authentication only)

## Quick Start

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and backend URL

# Run dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_API_BASE_URL` | Your Node.js backend base URL (default: `http://localhost:5000/api`) |

## Expected Backend API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/cars` | List cars (supports query params for filtering) |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my` | Get current user's bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |
| POST | `/api/payments` | Process a payment |

All protected routes expect `Authorization: Bearer <token>` header.

## Features
- 🏠 Hero homepage with floating search panel
- 🔍 Results page with filters sidebar
- 🚗 Car cards with book flow
- 🔐 Glassmorphism auth modal (login + register + Google OAuth)
- 📋 Booking form with insurance selection
- 💳 Payment page with card details
- 📂 My Bookings with cancel functionality
- 👤 Profile page
- 🔄 Mock data fallback when backend is unavailable

## Folder Structure
```
src/
├── components/     # Navbar, SearchBar, CarCard, BookingCard, Filters, AuthModal
├── pages/          # Home, Results, Booking, Payment, MyBookings, Profile
├── services/       # api.js (Axios)
├── context/        # AuthContext.jsx (Supabase session + modal)
├── hooks/          # useAuth.js
└── utils/          # helpers.js (formatCurrency, calcDays, etc.)
```
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar     from './components/Navbar'
import AuthModal  from './components/AuthModal'
import Home       from './pages/Home'
import Results    from './pages/Results'
import Booking    from './pages/Booking'
import Payment    from './pages/Payment'
import MyBookings from './pages/MyBookings'
import Profile    from './pages/Profile'
import Admin      from './pages/admin'
import ReservationDetails from './pages/ReservationDetails'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-cream">
          <Navbar />
          <AuthModal />
          <Routes>
            <Route path="/"         element={<Home />}       />
            <Route path="/results"  element={<Results />}    />
            <Route path="/booking"  element={<Booking />}    />
            <Route path="/payment"  element={<Payment />}    />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/profile"  element={<Profile />}    />
            <Route path="/admin"    element={<Admin />}      />
            <Route path="/reservation/:id" element={<ReservationDetails />} />
            <Route path="/invoice/:id"     element={<ReservationDetails />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
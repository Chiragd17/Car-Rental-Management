import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, setShowModal, requireAuth } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const isHome    = location.pathname === '/'

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const navBg    = isHome && !scrolled ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-forest/5'
  const textCls  = isHome && !scrolled ? 'text-white' : 'text-forest'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isHome && !scrolled ? 'bg-white text-forest' : 'bg-forest text-white'}`}>D</div>
          <span className={`font-display font-bold text-xl tracking-tight ${textCls}`}>DriveElite</span>
        </Link>

        {/* Links */}
        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${textCls}`}>
          <Link to="/results" className="opacity-80 hover:opacity-100 transition-opacity">Browse Cars</Link>
          <button onClick={() => requireAuth(() => navigate('/bookings'))} className="opacity-80 hover:opacity-100 transition-opacity">My Bookings</button>
          {user && <Link to="/profile" className="opacity-80 hover:opacity-100 transition-opacity">Profile</Link>}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className={`hidden sm:flex items-center gap-2 text-sm ${textCls} opacity-80`}>
                <div className="w-7 h-7 rounded-full bg-orange/20 flex items-center justify-center text-orange font-bold text-xs">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[130px] truncate">{user.email}</span>
              </div>
              <button onClick={logout} className={`text-sm px-4 py-1.5 rounded-full border transition-all ${isHome && !scrolled ? 'border-white/40 text-white hover:bg-white/10' : 'border-forest/20 text-forest hover:bg-forest/5'}`}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowModal(true)} className={`text-sm px-5 py-2 rounded-full font-medium transition-all ${isHome && !scrolled ? 'bg-white text-forest hover:bg-white/90' : 'bg-forest text-white hover:bg-forest/90'}`}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
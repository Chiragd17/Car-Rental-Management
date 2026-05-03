import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal() {
  const { showModal, setShowModal, supabase } = useAuth()
  const [tab,      setTab]      = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  useEffect(() => {
    if (showModal) { setError(''); setSuccess(''); setEmail(''); setPassword(''); setTab('login') }
  }, [showModal])

  if (!showModal) return null

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) setShowModal(false) }

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      setSuccess('Account created! Check your email to verify, then sign in.')
      setTab('login')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' })

  const inputCls = `w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white
    placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm backdrop-blur-sm transition-all`

  return (
    <div className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(21,43,33,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdrop}>
      <div className="modal-box relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: 'rgba(21,43,33,0.80)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
        <button onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all text-xl">×</button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange/20 flex items-center justify-center mx-auto mb-3 text-2xl">🚗</div>
            <h2 className="font-display text-2xl font-bold text-white">DriveElite</h2>
            <p className="text-white/50 text-sm mt-1">Premium Car Rentals</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden bg-white/10 p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${tab === t ? 'bg-white text-forest shadow-sm' : 'text-white/60 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-all mb-5">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/15" /><span className="text-white/30 text-xs">or</span><div className="flex-1 h-px bg-white/15" />
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">
            <input type="email" className={inputCls} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" className={inputCls} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

            {error   && <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2.5 text-red-200 text-sm">{error}</div>}
            {success && <div className="bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-2.5 text-green-200 text-sm">{success}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-orange text-white font-semibold py-3 rounded-xl hover:bg-orange/90 transition-all disabled:opacity-60 text-sm mt-2">
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
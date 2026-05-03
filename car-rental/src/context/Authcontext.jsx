import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { syncUser } from '../services/api'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(null)
  const [token,         setToken]         = useState(() => localStorage.getItem('auth_token'))
  const [loading,       setLoading]       = useState(true)
  const [showModal,     setShowModal]     = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  // After a successful Supabase login, sync the user to MySQL
  const handleSession = async (session) => {
    if (!session) return
    setUser(session.user)
    setToken(session.access_token)
    localStorage.setItem('auth_token', session.access_token)
    // Sync Supabase user → MySQL customer table
    try {
      await syncUser({
        first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name:  session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      })
    } catch (e) {
      console.warn('sync-user:', e.message)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleSession(session).then(() => {
          setShowModal(false)
          if (pendingAction) { pendingAction(); setPendingAction(null) }
        })
      } else {
        setUser(null)
        setToken(null)
        localStorage.removeItem('auth_token')
      }
    })

    return () => subscription.unsubscribe()
  }, [pendingAction])

  // Call this when user needs to be logged in to proceed
  const requireAuth = (action) => {
    if (user) { action() }
    else { setPendingAction(() => action); setShowModal(true) }
  }

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, token, loading, showModal, setShowModal, requireAuth, logout, supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

export default AuthContext
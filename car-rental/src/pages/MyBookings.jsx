import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingCard from '../components/BookingCard'
import { getMyReservations } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    if (!user) { navigate('/'); return }
    const fetch = async () => {
      setLoading(true); setError('')
      try {
        const res = await getMyReservations()
        // res = { success, count, data: [...] }
        setReservations(res.data || res)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user])

  const handleCancelled = (reserve_id) => {
    setReservations((prev) =>
      prev.map((r) => r.reserve_id === reserve_id
        ? { ...r, cancellation_details: 'Cancelled by customer' }
        : r
      )
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest">My Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">All your reservations in one place</p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-6 bg-gray-100 rounded w-1/2" />
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="h-8 bg-gray-100 rounded" />
                    <div className="h-8 bg-gray-100 rounded" />
                    <div className="h-8 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-display text-xl text-forest font-semibold">No bookings yet</h3>
            <p className="text-gray-400 text-sm mt-2 mb-6">Your reservation history will appear here</p>
            <button onClick={() => navigate('/results')}
              className="bg-orange text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-orange/90 transition-colors">
              Browse Vehicles
            </button>
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map((r) => (
              <BookingCard key={r.reserve_id} reservation={r} onCancelled={handleCancelled} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
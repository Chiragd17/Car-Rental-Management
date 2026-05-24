import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createReservation } from '../services/api'
import { formatCurrency, calcDays } from '../utils/helpers'

export default function Booking() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const vehicle    = state?.vehicle
  const sp         = state?.searchParams || {}

  const [pickupLocation, setPickupLocation] = useState(sp.location || '')
  const [pickupDate,     setPickupDate]     = useState(sp.pickup     || '')
  const [returnDate,     setReturnDate]     = useState(sp.returnDate || '')
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  if (!vehicle) return (
    <div className="min-h-screen bg-cream pt-28 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🚗</div>
        <h2 className="font-display text-2xl text-forest font-bold">No vehicle selected</h2>
        <button onClick={() => navigate('/results')} className="mt-4 text-orange underline text-sm">Browse vehicles</button>
      </div>
    </div>
  )

  const days  = calcDays(pickupDate, returnDate)
  const base_rent = Number(vehicle.daily_price) * days

  // Calculate Tax dynamically for preview
  const type = (vehicle.vehicle_type || '').toLowerCase();
  const modelName = (vehicle.model || '').toLowerCase();
  let tax_percentage = 12;
  if (['hatchback', 'sedan', 'compact suv'].includes(type)) tax_percentage = 5;
  if (['suv', 'muv', 'ev'].includes(type)) tax_percentage = 12;
  if (type.includes('luxury') || ['bmw', 'mercedes', 'audi', 'jaguar'].some(m => modelName.includes(m))) tax_percentage = 18;

  const tax_amount = (base_rent * tax_percentage) / 100;
  const total = base_rent + tax_amount;

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pickupLocation || !pickupDate || !returnDate) {
      setError('Please fill in all fields.'); return
    }
    setError(''); setLoading(true)
    try {
      // Exact payload reservationController.create expects:
      const res = await createReservation({
        vehicle_id:      vehicle.vehicle_id,
        pickup_date:     pickupDate,
        return_date:     returnDate,
        pickup_location: pickupLocation,
      })
      // res.data.reserve_id comes back from backend
      navigate('/payment', { state: { reserve_id: res.data.reserve_id, vehicle, total, pickupDate, returnDate } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-forest
    focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all`
  const labelCls = 'block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5'

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-forest mb-6 flex items-center gap-1">← Back</button>
        <h1 className="font-display text-3xl font-bold text-forest mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-semibold text-lg text-forest mb-5">Trip Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Pickup Location</label>
                    <input className={inputCls} placeholder="City or address" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Pickup Date</label>
                      <input type="date" className={inputCls} min={new Date().toISOString().split('T')[0]} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Return Date</label>
                      <input type="date" className={inputCls} min={pickupDate} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

              <button type="submit" disabled={loading}
                className="btn-primary w-full bg-orange text-white font-semibold py-4 rounded-xl hover:bg-orange/90 text-base disabled:opacity-60">
                {loading ? 'Creating reservation…' : 'Proceed to Payment'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg text-forest mb-4">Vehicle Summary</h2>

              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-xl">🚗</div>
                <div>
                  <p className="font-semibold text-forest text-sm">{vehicle.model}</p>
                  <p className="text-xs text-gray-400 font-mono">{vehicle.plate_no}</p>
                  <p className="text-xs text-gray-400">Condition: {vehicle.condition}</p>
                </div>
              </div>

              <div className="py-4 space-y-3 text-sm border-b border-gray-100">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-500 shrink-0">Daily rate</span>
                  <span className="font-medium text-right">{formatCurrency(vehicle.daily_price)}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-500 shrink-0">Duration</span>
                  <span className="font-medium text-right">{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-start mt-2 pt-2 border-t border-gray-50 gap-4">
                  <span className="text-gray-500 shrink-0">Base Rental</span>
                  <span className="font-medium text-right">{formatCurrency(base_rent)}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-500 shrink-0">GST ({tax_percentage}%)</span>
                  <span className="font-medium text-right">{formatCurrency(tax_amount)}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center gap-4">
                <span className="font-semibold text-forest shrink-0">Estimated Total</span>
                <span className="font-display font-bold text-2xl text-forest text-right tracking-normal">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">* Final amount calculated by server based on actual days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
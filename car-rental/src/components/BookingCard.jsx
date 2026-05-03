import React, { useState } from 'react'
import { cancelReservation } from '../services/api'
import { formatCurrency, formatDate, reservationStatus, statusColor } from '../utils/helpers'

export default function BookingCard({ reservation, onCancelled }) {
  const [cancelling, setCancelling] = useState(false)
  const [error,      setError]      = useState('')

  // Fields from reservationModel.findByCustomerId JOIN vehicle:
  // reserve_id, reserve_date, pickup_date, return_date, number_of_days,
  // pickup_location, cancellation_details, cust_id, vehicle_id,
  // model, plate_no, daily_price, estimated_total
  const {
    reserve_id, pickup_date, return_date, number_of_days,
    pickup_location, cancellation_details,
    model, plate_no, daily_price, estimated_total,
  } = reservation

  const status    = reservationStatus(reservation)
  const isCancellable = status === 'Confirmed'

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(true); setError('')
    try {
      await cancelReservation(reserve_id)
      onCancelled?.(reserve_id)
    } catch (err) { setError(err.message) }
    finally { setCancelling(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(status)}`}>{status}</span>
            <span className="text-xs text-gray-400 font-mono">#{reserve_id}</span>
          </div>

          <h3 className="font-display font-bold text-xl text-forest">{model}</h3>
          <p className="text-sm text-gray-400 font-mono mt-0.5">{plate_no}</p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Pickup</p>
              <p className="text-sm font-medium text-forest mt-0.5">{formatDate(pickup_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Return</p>
              <p className="text-sm font-medium text-forest mt-0.5">{formatDate(return_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Duration</p>
              <p className="text-sm font-medium text-forest mt-0.5">{number_of_days} day{number_of_days !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Location</p>
              <p className="text-sm font-medium text-forest mt-0.5">{pickup_location}</p>
            </div>
            {daily_price && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Daily Rate</p>
                <p className="text-sm font-medium text-forest mt-0.5">{formatCurrency(daily_price)}</p>
              </div>
            )}
          </div>

          {cancellation_details && (
            <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              Cancellation: {cancellation_details}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          {estimated_total && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Estimated Total</p>
              <p className="text-xl font-display font-bold text-forest">{formatCurrency(estimated_total)}</p>
            </div>
          )}
          {isCancellable && (
            <button onClick={handleCancel} disabled={cancelling}
              className="text-sm font-medium text-red-600 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-50">
              {cancelling ? 'Cancelling…' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
    </div>
  )
}
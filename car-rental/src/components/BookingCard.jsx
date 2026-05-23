import React, { useState } from 'react'
import { cancelReservation } from '../services/api'
import { formatCurrency, formatDate, reservationStatus, statusColor } from '../utils/helpers'
import CancelModal from './CancelModal'

export default function BookingCard({ reservation, onCancelled }) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [error, setError] = useState('')

  // Fields from reservationModel.findByCustomerId JOIN vehicle:
  // reserve_id, reserve_date, pickup_date, return_date, number_of_days,
  // pickup_location, cancellation_details, cancellation_reason,
  // refund_amount, refund_percentage, cust_id, vehicle_id,
  // model, plate_no, daily_price, estimated_total
  const {
    reserve_id, pickup_date, return_date, number_of_days,
    pickup_location, cancellation_details, cancellation_reason,
    refund_amount, refund_percentage,
    model, plate_no, daily_price, estimated_total,
    total_pay, damage_compensation, damage_description,
    tax_percentage, tax_amount, base_rent
  } = reservation

  const status = reservationStatus(reservation)
  const isCancellable = status === 'Confirmed'
  const isCancelled = status === 'Cancelled'
  const hasRefund = isCancelled && Number(refund_amount) > 0

  const handleCancelConfirm = async ({ cancellation_reason, cancellation_details }) => {
    setError('')
    try {
      const result = await cancelReservation(reserve_id, {
        cancellation_reason,
        cancellation_details,
      })
      setShowCancelModal(false)
      // Pass full cancellation data back to parent for state update
      onCancelled?.(reserve_id, {
        cancellation_details: result.cancellation_details,
        cancellation_reason: result.cancellation_reason,
        refund_amount: result.final_refund,
        refund_percentage: result.refund_percentage,
        damage_compensation: result.damage_compensation,
      })
    } catch (err) {
      throw err // Let the modal handle the error display
    }
  }

  return (
    <>
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

            {/* ── Cancellation Info Banner ─────────────────────── */}
            {isCancelled && (
              <div className="mt-4 space-y-2">
                {/* Reason banner */}
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Cancelled</span>
                  </div>
                  {cancellation_reason && (
                    <p className="text-sm text-red-600 font-medium">{cancellation_reason}</p>
                  )}
                  {cancellation_details && !cancellation_reason && (
                    <p className="text-sm text-red-500">{cancellation_details}</p>
                  )}
                </div>

                {/* Refund info banner */}
                {hasRefund ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Refund Processed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">{refund_percentage}%</span> refund applied
                        </p>
                        {reservation.damage_compensation > 0 && (
                          <p className="text-xs text-green-600/70">
                            Damage deduction: {formatCurrency(reservation.damage_compensation)}
                          </p>
                        )}
                      </div>
                      <p className="font-display font-bold text-lg text-green-700">
                        {formatCurrency(refund_amount)}
                      </p>
                    </div>
                  </div>
                ) : isCancelled && Number(refund_percentage) === 0 ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500">No refund — cancelled too close to pickup date</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right flex flex-col items-end">
              <div className="bg-cream/50 border border-gray-100 rounded-xl p-3 mb-2 text-xs text-right w-56 space-y-1.5">
                <div className="flex justify-between text-gray-500"><span className="text-left font-medium">Rental Cost:</span><span>{formatCurrency(base_rent)}</span></div>
                <div className="flex justify-between text-gray-500"><span className="text-left font-medium">GST ({tax_percentage}%):</span><span>{formatCurrency(tax_amount)}</span></div>
                {Number(damage_compensation) > 0 && <div className="flex justify-between text-red-500"><span className="text-left font-medium">Damage:</span><span>+{formatCurrency(damage_compensation)}</span></div>}
                {hasRefund && <div className="flex justify-between text-green-600"><span className="text-left font-medium">Refund:</span><span>-{formatCurrency(refund_amount)}</span></div>}
              </div>
              
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{total_pay ? 'Final Total' : 'Estimated Total'}</p>
              <p className="text-2xl font-display font-bold text-forest">{formatCurrency(total_pay || estimated_total)}</p>
              
              {damage_description && Number(damage_compensation) > 0 && (
                <p className="text-[10px] text-red-500/80 mt-1.5 max-w-[200px] leading-snug">
                  Damage reason: "{damage_description}"
                </p>
              )}
            </div>
            {isCancellable && (
              <button onClick={() => setShowCancelModal(true)}
                className="text-sm font-medium text-red-600 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-50 transition-colors">
                Cancel Booking
              </button>
            )}
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      </div>

      {/* ── Cancel Modal ─────────────────────────────────── */}
      {showCancelModal && (
        <CancelModal
          reservation={reservation}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </>
  )
}
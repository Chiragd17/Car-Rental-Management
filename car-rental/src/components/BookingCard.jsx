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
    total_pay, damage_compensation, damage_description, damage_notes,
    tax_percentage, tax_amount, base_rent,
    amount_paid, extra_charges, pending_amount
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
        damage_compensation: result.damage_deduction,
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
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Refund Processed</span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-green-800">
                        <span>Refund Eligibility</span>
                        <span className="font-semibold">{refund_percentage}% of Base Rent</span>
                      </div>
                      <div className="flex justify-between text-green-800">
                        <span>Refundable Base Amount</span>
                        <span className="font-semibold">{formatCurrency(Number(refund_amount) + Number(damage_compensation || 0))}</span>
                      </div>
                      <div className="flex justify-between text-red-600/80">
                        <span>Non-refundable GST</span>
                        <span>{formatCurrency(tax_amount)}</span>
                      </div>
                      {Number(damage_compensation) > 0 && (
                        <div className="flex justify-between text-red-600/80">
                          <span>Damage Deduction</span>
                          <span>-{formatCurrency(damage_compensation)}</span>
                        </div>
                      )}
                      <div className="border-t border-green-200/60 pt-1.5 mt-1.5 flex justify-between">
                        <span className="font-bold text-green-800 text-sm">Final Refund</span>
                        <span className="font-display font-bold text-lg text-green-700">
                          {formatCurrency(refund_amount)}
                        </span>
                      </div>
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

            {/* ── Pending Payment Warning ────────────────────── */}
            {Number(pending_amount) > 0 && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-orange-900 uppercase tracking-widest">Additional Payment Required</h4>
                    <p className="text-xs text-orange-800 mt-1">Due to post-rental charges, there is an outstanding balance on your reservation.</p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-2">
                  <div className="text-right">
                    <p className="text-[10px] text-orange-800 font-bold uppercase tracking-widest mb-0.5">Pending Due</p>
                    <p className="text-2xl font-display font-bold text-orange-600">{formatCurrency(pending_amount)}</p>
                  </div>
                  <button onClick={() => alert("Online payment gateway integration coming soon.")}
                    className="px-4 py-2 bg-orange hover:bg-orange/90 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest shadow-sm">
                    Pay Now
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right flex flex-col items-end">
              <div className="bg-cream/50 border border-gray-100 rounded-xl p-3 mb-2 text-xs text-right w-56 space-y-1.5">
                <div className="flex justify-between text-gray-500"><span className="text-left font-medium">Rental Cost:</span><span>{formatCurrency(base_rent)}</span></div>
                <div className="flex justify-between text-gray-500"><span className="text-left font-medium">GST ({tax_percentage}%):</span><span>{formatCurrency(tax_amount)}</span></div>
                {Number(damage_compensation) > 0 && <div className="flex justify-between text-red-500"><span className="text-left font-medium">Damage:</span><span>+{formatCurrency(damage_compensation)}</span></div>}
                {Number(extra_charges) > 0 && <div className="flex justify-between text-red-500"><span className="text-left font-medium">Extra Charges:</span><span>+{formatCurrency(extra_charges)}</span></div>}
                {hasRefund && <div className="flex justify-between text-green-600"><span className="text-left font-medium">Refund:</span><span>-{formatCurrency(refund_amount)}</span></div>}
                {total_pay && <div className="flex justify-between text-gray-500 border-t border-gray-200 pt-1.5 mt-1.5"><span className="text-left font-medium">Already Paid:</span><span>{formatCurrency(amount_paid || (total_pay && !pending_amount ? total_pay : estimated_total))}</span></div>}
              </div>
              
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{total_pay ? 'Final Total' : 'Estimated Total'}</p>
              <p className="text-2xl font-display font-bold text-forest">{formatCurrency(total_pay || estimated_total)}</p>
              
              {(damage_description || damage_notes) && Number(damage_compensation) > 0 && (
                <p className="text-[10px] text-red-500/80 mt-1.5 max-w-[200px] leading-snug">
                  Notes: "{damage_notes || damage_description}"
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
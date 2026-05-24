import React, { useState, useMemo } from 'react'
import { formatCurrency } from '../utils/helpers'

const CANCEL_REASONS = [
  { id: 'plans',     label: 'Change of plans',            icon: '📅' },
  { id: 'better',    label: 'Found a better deal',        icon: '💰' },
  { id: 'not_needed',label: 'Vehicle no longer needed',   icon: '🚫' },
  { id: 'emergency', label: 'Emergency / personal reason', icon: '🆘' },
  { id: 'other',     label: 'Other',                       icon: '✏️' },
]

function formatHoursRemaining(hours) {
  if (hours <= 0) return 'Pickup has already started'
  const h = Math.floor(hours)
  if (h >= 24) {
    const days = Math.floor(h / 24)
    const rem = h % 24
    return `${days}d ${rem}h remaining`
  }
  return `${h}h remaining`
}

function calculateRefundPreview(pickupDate, baseRent, taxAmount) {
  const now = new Date()
  
  // Robust parsing: convert to ISO string and slice to get YYYY-MM-DD
  const dateStr = typeof pickupDate === 'string' 
    ? pickupDate 
    : new Date(pickupDate).toISOString()
  const yyyymmdd = dateStr.slice(0, 10)
  
  // Assuming standard pickup starts at 09:00 AM on the pickup date
  const pickup = new Date(`${yyyymmdd}T09:00:00`)

  const diffMs = pickup.getTime() - now.getTime()
  const hoursUntilPickup = diffMs / (1000 * 60 * 60)

  let percentage = 0
  if (hoursUntilPickup > 48) percentage = 100
  else if (hoursUntilPickup >= 24) percentage = 75
  else if (hoursUntilPickup >= 12) percentage = 50

  const refundableAmount = Math.round((Number(baseRent) * percentage) / 100)
  const nonRefundableGst = Number(taxAmount) || 0

  return { hoursUntilPickup, percentage, refundableAmount, nonRefundableGst }
}

export default function CancelModal({ reservation, onConfirm, onClose }) {
  const [selectedReason, setSelectedReason] = useState('')
  const [otherText, setOtherText]           = useState('')
  const [confirming, setConfirming]         = useState(false)
  const [error, setError]                   = useState('')

  const { pickup_date, base_rent = 0, tax_amount = 0 } = reservation

  // Preview refund calculation (mirrors backend logic)
  const preview = useMemo(
    () => calculateRefundPreview(pickup_date, base_rent, tax_amount),
    [pickup_date, base_rent, tax_amount]
  )

  // We don't know damage_compensation on the frontend until the backend responds,
  // so we show it as "TBD" if we can't determine it
  const damageNote = 'Damage compensation (if any) will be deducted from the refund.'

  const reasonLabel = CANCEL_REASONS.find((r) => r.id === selectedReason)?.label || ''
  const detailsText = selectedReason === 'other' ? otherText.trim() : reasonLabel

  const canSubmit = selectedReason && (selectedReason !== 'other' || otherText.trim().length > 0)

  const handleConfirm = async () => {
    if (!canSubmit) return
    setConfirming(true)
    setError('')
    try {
      await onConfirm({
        cancellation_reason: reasonLabel || otherText.trim(),
        cancellation_details: detailsText,
      })
    } catch (err) {
      setError(err.message || 'Failed to cancel reservation')
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 modal-backdrop"
         style={{ background: 'rgba(21, 43, 33, 0.45)', backdropFilter: 'blur(4px)' }}
         onClick={onClose}>

      <div className="modal-box bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
           onClick={(e) => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-forest">Cancel Booking</h2>
                <p className="text-xs text-gray-400">Reservation #{reservation.reserve_id}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-forest transition-colors">
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

          {/* Reason selection */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Why are you cancelling?
            </p>
            <div className="space-y-2">
              {CANCEL_REASONS.map(({ id, label, icon }) => (
                <label key={id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all
                    ${selectedReason === id
                      ? 'bg-red-50/60 border-red-200 text-red-700'
                      : 'border-gray-100 text-forest hover:border-red-100 hover:bg-red-50/20'
                    }`}>
                  <input type="radio" name="cancel-reason" value={id}
                    checked={selectedReason === id}
                    onChange={() => setSelectedReason(id)}
                    className="sr-only" />
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  {selectedReason === id && (
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            </div>

            {/* Other reason textarea */}
            {selectedReason === 'other' && (
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Please describe your reason…"
                rows={3}
                className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-forest
                  focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all
                  placeholder:text-gray-300 resize-none"
              />
            )}
          </div>

          {/* Refund preview */}
          <div className="bg-cream rounded-2xl p-4 mb-4 border border-orange/20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Cancellation & Refund Summary
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Base Rental</span>
                <span className="font-semibold text-forest">{formatCurrency(base_rent)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Non-refundable GST & Platform Charges</span>
                  <span className="text-[10px] text-gray-400">Taxes and platform charges are retained upon cancellation.</span>
                </div>
                <span className="font-semibold text-red-500">{formatCurrency(tax_amount)}</span>
              </div>

              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Refund Eligibility</span>
                <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                  preview.percentage >= 75 ? 'bg-green-50 text-green-700' :
                  preview.percentage >= 50 ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-600'
                }`}>
                  {preview.percentage}%
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Refundable Amount</span>
                <span className="font-semibold text-green-600">{formatCurrency(preview.refundableAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Damage Deduction</span>
                <span className="font-semibold text-gray-400">TBD</span>
              </div>

              <div className="border-t border-gray-200/60 pt-2.5 flex items-center justify-between">
                <span className="font-semibold text-forest text-sm">Final Estimated Refund</span>
                <span className="font-display font-bold text-lg text-green-600">
                  {formatCurrency(preview.refundableAmount)}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                ⚠️ Damage compensation (if any) will be further deducted from the final refund.
              </p>
            </div>
          </div>

          {/* Refund policy info */}
          <div className="bg-blue-50/50 rounded-xl p-3 mb-1">
            <p className="text-xs font-semibold text-blue-600 mb-1.5">📋 Refund Policy (Applied to Base Rent Only)</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-blue-700/80">
              <span>More than 48 hours before pickup</span><span className="font-semibold text-right">100% refund</span>
              <span>Between 24–48 hours before</span><span className="font-semibold text-right">75% refund</span>
              <span>Between 12–24 hours before</span><span className="font-semibold text-right">50% refund</span>
              <span>Less than 12 hours / after pickup</span><span className="font-semibold text-right">No refund</span>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-forest font-semibold text-sm
              hover:bg-gray-50 transition-colors"
            disabled={confirming}>
            Go Back
          </button>
          <button onClick={handleConfirm}
            disabled={!canSubmit || confirming}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm
              hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {confirming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Processing…
              </span>
            ) : 'Confirm Cancellation'}
          </button>
        </div>

        {error && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

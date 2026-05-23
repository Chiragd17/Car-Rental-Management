import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createRent } from '../services/api'
import { formatCurrency, today } from '../utils/helpers'

const CARD_TYPES = ['Visa', 'Mastercard', 'RuPay', 'Amex']

export default function Payment() {
  const { state }  = useLocation()
  const navigate   = useNavigate()

  const reserve_id = state?.reserve_id
  const vehicle    = state?.vehicle
  const total      = state?.total || 0

  const [payMethod,  setPayMethod]  = useState('Card')
  const [cardType,   setCardType]   = useState('Visa')
  const [cardNo,     setCardNo]     = useState('')
  const [nameOnCard, setNameOnCard] = useState('')
  const [expiry,     setExpiry]     = useState('')
  const [cvv,        setCvv]        = useState('')
  const [upiId,      setUpiId]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [paid,       setPaid]       = useState(false)
  const [rentId,     setRentId]     = useState(null)

  if (!reserve_id) return (
    <div className="min-h-screen bg-cream pt-28 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">💳</div>
        <h2 className="font-display text-2xl text-forest font-bold">No reservation found</h2>
        <button onClick={() => navigate('/results')} className="mt-4 text-orange underline text-sm">Browse cars</button>
      </div>
    </div>
  )

  const handleCardNo = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCardNo(val.replace(/(.{4})/g, '$1 ').trim())
  }
  const handleExpiry = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
    setExpiry(v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await createRent({
        reserve_id,
        pay_method:   payMethod === 'Card' ? 'Card' : 'UPI',
        pay_date:     today(),
        down_payment: total,
        refund:       0,
        damage_compensation: 0,
      })
      setRentId(res.data?.rent_id)
      setPaid(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-forest
    focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all`
  const labelCls = 'block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5'

  if (paid) return (
    <div className="min-h-screen bg-cream pt-28 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center shadow-lg">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-3xl font-bold text-forest">Booking Confirmed!</h2>
        <p className="text-gray-400 text-sm mt-3 leading-relaxed">
          Your <strong>{vehicle?.model}</strong> has been successfully booked!
        </p>
        <div className="mt-5 bg-cream rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Reservation ID</span>
            <span className="font-mono font-semibold text-forest">#{reserve_id}</span>
          </div>
          {rentId && (
            <div className="flex justify-between">
              <span className="text-gray-400">Rent ID</span>
              <span className="font-mono font-semibold text-forest">#{rentId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Amount Paid</span>
            <span className="font-semibold text-forest">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Payment Method</span>
            <span className="font-semibold text-forest">{payMethod === 'Card' ? `${cardType} Card` : 'UPI'}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate('/bookings')} className="flex-1 bg-forest text-white font-semibold py-3 rounded-xl text-sm hover:bg-forest/90 transition-colors">My Bookings</button>
          <button onClick={() => navigate('/')} className="flex-1 border border-gray-200 text-forest font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">Home</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-forest mb-6 flex items-center gap-1">← Back</button>
        <h1 className="font-display text-3xl font-bold text-forest mb-8">Secure Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6">

              {/* Pay method tabs - only Card and UPI */}
              <div className="flex gap-3 mb-6">
                {['Card', 'UPI'].map((m) => (
                  <button type="button" key={m} onClick={() => setPayMethod(m)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                      payMethod === m
                        ? 'bg-orange/10 border-orange/40 text-orange'
                        : 'border-gray-200 text-forest hover:border-orange/20'
                    }`}>
                    {m === 'Card' ? '💳' : '📱'} {m}
                  </button>
                ))}
              </div>

              {payMethod === 'Card' && (
                <div className="space-y-4">
                  {/* Card type dropdown */}
                  <div>
                    <label className={labelCls}>Card Type</label>
                    <select className={inputCls} value={cardType} onChange={(e) => setCardType(e.target.value)}>
                      {CARD_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Card Number</label>
                    <input className={inputCls} placeholder="1234 5678 9012 3456"
                      value={cardNo} onChange={handleCardNo} required maxLength={19} />
                  </div>

                  <div>
                    <label className={labelCls}>Name on Card</label>
                    <input className={inputCls} placeholder="As printed on card"
                      value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Expiry</label>
                      <input className={inputCls} placeholder="MM/YY"
                        value={expiry} onChange={handleExpiry} required maxLength={5} />
                    </div>
                    <div>
                      <label className={labelCls}>CVV</label>
                      <input type="password" className={inputCls} placeholder="•••"
                        value={cvv} onChange={(e) => setCvv(e.target.value)} required maxLength={4} />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === 'UPI' && (
                <div>
                  <label className={labelCls}>UPI ID</label>
                  <input className={inputCls} placeholder="yourname@upi"
                    value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
                  <p className="text-xs text-gray-400 mt-2">e.g. name@okicici, name@ybl, name@paytm</p>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary mt-6 w-full bg-orange text-white font-semibold py-4 rounded-xl hover:bg-orange/90 text-base disabled:opacity-60">
                {loading ? 'Processing…' : `Pay ${formatCurrency(total)}`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Secured by 256-bit SSL encryption</p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-semibold text-lg text-forest mb-4">Order Summary</h2>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-lg">🚗</div>
                <div>
                  <p className="font-semibold text-forest text-sm">{vehicle?.model}</p>
                  <p className="text-xs text-gray-400 font-mono">{vehicle?.plate_no}</p>
                </div>
              </div>
              <div className="py-4 space-y-3 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-400 shrink-0">Reservation #</span>
                  <span className="font-mono font-medium text-forest text-right">{reserve_id}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-400 shrink-0">Dates</span>
                  <span className="font-medium text-forest text-right whitespace-nowrap tracking-tight text-[13px]">{state?.pickupDate} to {state?.returnDate}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center gap-4">
                <span className="font-semibold text-forest shrink-0">Total</span>
                <span className="font-display font-bold text-2xl text-forest text-right tracking-wider">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
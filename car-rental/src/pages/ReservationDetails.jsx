import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import html2pdf from 'html2pdf.js'
import { getFullReservationDetails } from '../services/api'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function ReservationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const invoiceRef = useRef(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getFullReservationDetails(id)
        setReservation(res.data)
      } catch (err) {
        setError(err.message || 'Failed to load reservation details')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  const handleDownloadInvoice = () => {
    if (!invoiceRef.current) return
    const element = invoiceRef.current
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Invoice_${reservation.reserve_id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center pt-20 px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!reservation) return null

  // Derived status & financials
  const hasPendingDues = Number(reservation.pending_amount) > 0
  const isCancelled = !!reservation.cancellation_details
  const isCompleted = !!reservation.completed_at || new Date(reservation.return_date) < new Date()
  const hasRefund = Number(reservation.refund) > 0

  let paymentStatus = 'Active'
  let statusColor = 'bg-blue-100 text-blue-700 border-blue-200'

  if (isCancelled) {
    paymentStatus = 'Cancelled'
    statusColor = 'bg-red-100 text-red-700 border-red-200'
  } else if (hasPendingDues) {
    paymentStatus = 'Pending Payment'
    statusColor = 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm'
  } else if (isCompleted) {
    paymentStatus = 'Completed'
    statusColor = 'bg-gray-100 text-gray-700 border-gray-200'
  } else if (reservation.total_pay) {
    paymentStatus = 'Fully Paid'
    statusColor = 'bg-green-100 text-green-700 border-green-200'
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-forest transition-colors font-semibold text-sm flex items-center gap-2">
            <span>←</span> Back
          </button>
          <div className="flex gap-3">
            <button onClick={handleDownloadInvoice} className="bg-forest text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-forest/90 transition-colors flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download Invoice PDF
            </button>
          </div>
        </div>

        {/* Invoice Container (This ref is captured for PDF) */}
        <div ref={invoiceRef} className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-lg relative overflow-hidden">
          
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-green-50 rounded-full opacity-50 blur-3xl pointer-events-none" />

          {/* Top Banner / Verification Section */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-8 mb-8 gap-8 relative z-10">
            <div>
              <p className="text-orange font-bold tracking-widest uppercase text-xs mb-1">DriveElite Rentals</p>
              <h1 className="text-3xl font-display font-bold text-forest">Digital Invoice & Verification</h1>
              <div className="mt-4 flex items-center gap-3 text-sm font-mono text-gray-500">
                <span className="bg-gray-100 px-3 py-1 rounded-lg">ID: {reservation.reserve_id}</span>
                <span>•</span>
                <span>Generated: {formatDate(new Date().toISOString())}</span>
              </div>
            </div>
            <div className="flex flex-col items-center p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <QRCodeSVG 
                value={`${import.meta.env.VITE_FRONTEND_URL}/reservation/${reservation.reserve_id}`} 
                size={100}
                fgColor="#152b21"
              />
              <div className="mt-3 flex items-center gap-1.5 text-green-600 font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified
              </div>
            </div>
          </div>

          {/* Pending Dues Banner in PDF */}
          {hasPendingDues && !isCancelled && (
            <div className="mb-8 bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center gap-4 text-orange-800">
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs">Payment Pending</h4>
                <p className="text-sm mt-0.5">There is an outstanding balance of <span className="font-bold">{formatCurrency(reservation.pending_amount)}</span> on this reservation.</p>
              </div>
            </div>
          )}

          {/* Cancelled Banner */}
          {isCancelled && (
            <div className="mb-8 bg-red-50 border border-red-200 p-4 rounded-xl text-red-700">
              <h4 className="font-bold uppercase tracking-widest text-xs mb-1">Reservation Cancelled</h4>
              <p className="text-sm">Reason: {reservation.cancellation_details}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-8">
              
              {/* Customer Details */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Customer Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Full Name</p>
                    <p className="text-forest font-semibold">{reservation.first_name} {reservation.last_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-forest font-medium text-sm truncate">{reservation.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                      <p className="text-forest font-medium text-sm">{reservation.contact_no}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Customer ID</p>
                    <p className="text-forest font-mono text-sm">#{reservation.cust_id}</p>
                  </div>
                </div>
              </section>

              {/* Booking Details */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Booking Timeline</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pickup Date</p>
                      <p className="text-forest font-bold mt-1 text-sm">{formatDate(reservation.pickup_date)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Return Date</p>
                      <p className="text-forest font-bold mt-1 text-sm">{formatDate(reservation.return_date)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Duration</p>
                      <p className="text-forest font-medium text-sm">{reservation.number_of_days} Day(s)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Booking Date</p>
                      <p className="text-forest font-medium text-sm">{formatDate(reservation.reserve_date)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Booking Status</p>
                    <p className="text-forest font-medium text-sm">{isCancelled ? 'Cancelled' : (isCompleted ? 'Completed / Returned' : 'Active / Scheduled')}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Vehicle Details */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Vehicle Details</h3>
                <div className="flex gap-4">
                  {reservation.image_url ? (
                    <img src={reservation.image_url} alt={reservation.model} className="w-24 h-24 object-cover rounded-xl border border-gray-100" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-3xl">🚗</div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xl font-display font-bold text-forest leading-tight">{reservation.model}</p>
                      <p className="text-xs font-mono text-gray-500">{reservation.plate_no}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{reservation.vehicle_type}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{reservation.fuel_type || 'Petrol'}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{reservation.transmission || 'Auto'}</span>
                    </div>
                    <div className="pt-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Pickup Location</p>
                      <p className="text-sm font-medium text-forest truncate">{reservation.pickup_location}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Financial Summary */}
              <section>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Financial Summary</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusColor}`}>
                    {paymentStatus}
                  </span>
                </div>
                
                <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Base Rental ({reservation.number_of_days} days × {formatCurrency(reservation.daily_price)})</span>
                    <span className="text-forest font-semibold">{formatCurrency(reservation.base_rent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">GST ({reservation.tax_percentage}%)</span>
                    <span className="text-forest font-semibold">{formatCurrency(reservation.tax_amount)}</span>
                  </div>
                  
                  {/* Additional Charges / Adjustments */}
                  {(Number(reservation.extra_charges) > 0 || Number(reservation.damage_compensation) > 0 || hasRefund) && (
                    <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                      {Number(reservation.extra_charges) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-500 font-medium">Extra Charges</span>
                          <span className="text-red-600 font-semibold">+{formatCurrency(reservation.extra_charges)}</span>
                        </div>
                      )}
                      {Number(reservation.damage_compensation) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-500 font-medium">Damage Compensation</span>
                          <span className="text-red-600 font-semibold">+{formatCurrency(reservation.damage_compensation)}</span>
                        </div>
                      )}
                      {hasRefund && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600 font-medium">Refund Amount</span>
                          <span className="text-green-700 font-semibold">-{formatCurrency(reservation.refund)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gross Total</span>
                      <span className="text-xl font-display font-bold text-forest">
                        {formatCurrency(reservation.total_pay || reservation.estimated_total)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Amount Paid</span>
                      <span className="text-forest font-semibold">{formatCurrency(reservation.amount_paid || (reservation.total_pay && !reservation.pending_amount ? reservation.total_pay : 0))}</span>
                    </div>
                    {hasPendingDues && (
                      <div className="flex justify-between items-center bg-orange-50 border border-orange-100 p-2 rounded-lg mt-2">
                        <span className="text-orange-800 font-bold text-xs uppercase tracking-widest">Pending Due</span>
                        <span className="text-orange-600 font-bold">{formatCurrency(reservation.pending_amount)}</span>
                      </div>
                    )}
                  </div>
                  
                </div>
              </section>

            </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            DriveElite Rentals • Thank you for your business
          </div>
        </div>
      </div>
    </div>
  )
}

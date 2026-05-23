// Format INR currency
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount || 0).replace(/^(\D+)/, '$1\u00A0\u00A0')

// Calculate rental days between two date strings
export const calcDays = (pickup, returnDate) => {
  if (!pickup || !returnDate) return 1
  const diff = Math.ceil((new Date(returnDate) - new Date(pickup)) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 1
}

// Format date for display
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Condition badge colour
export const conditionColor = (condition) => {
  const map = {
    Excellent: 'bg-green-50 text-green-700',
    Good:      'bg-blue-50 text-blue-700',
    Fair:      'bg-yellow-50 text-yellow-700',
    Poor:      'bg-red-50 text-red-600',
  }
  return map[condition] || 'bg-gray-100 text-gray-600'
}

// Reservation status derived from cancellation_details
export const reservationStatus = (r) => {
  if (r.cancellation_details) return 'Cancelled'
  const today = new Date()
  const ret   = new Date(r.return_date)
  return ret < today ? 'Completed' : 'Confirmed'
}

export const statusColor = (status) => {
  const map = {
    Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-600 border-gray-200'
}

// Today's date in YYYY-MM-DD
export const today = () => new Date().toISOString().split('T')[0]
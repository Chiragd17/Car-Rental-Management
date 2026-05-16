import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { today } from '../utils/helpers'

const CITIES = [
  'Mumbai - Marine Drive',
  'Delhi - India Gate',
  'Bangalore - MG Road',
  'Hyderabad - Charminar',
  'Chennai - Marina Beach',
  'Kolkata - Victoria Memorial',
  'Pune - Shaniwar Wada',
  'Ahmedabad - Sabarmati Ashram',
  'Goa - Baga Beach',
  'Jaipur - Hawa Mahal',
]

function LocationInput({ value, onChange, className, placeholder, required }) {
  const [open, setOpen] = useState(false)
  
  const filtered = CITIES.filter(c => c.toLowerCase().includes(value.toLowerCase()))

  return (
    <div className="relative">
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        required={required}
      />
      {open && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(city => (
            <div key={city}
              className="px-4 py-3 text-sm text-forest hover:bg-orange/10 hover:text-orange cursor-pointer transition-colors border-b border-gray-50 last:border-0"
              onClick={() => { onChange(city); setOpen(false) }}
            >
              {city}
            </div>
          )) : (
            <div className="px-4 py-3 text-sm text-gray-400">No matches found</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchBar({ initialValues = {}, compact = false }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    location:   initialValues.location   || '',
    pickup:     initialValues.pickup     || today(),
    returnDate: initialValues.returnDate || '',
    available:  initialValues.available  || 'true',
  })
  const [error, setError] = useState('')
  const set = (k) => (e) => {
    setError('')
    setForm((p) => ({ ...p, [k]: e.target.value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!form.location.trim()) {
      setError('Location is required.')
      return
    }
    const params = new URLSearchParams({
      location:   form.location,
      pickup:     form.pickup,
      returnDate: form.returnDate,
      available:  form.available,
    })
    navigate(`/results?${params}`)
  }

  const inputCls = `w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-forest
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all`
  const labelCls = 'block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5'

  if (compact) return (
    <div className="relative">
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className={labelCls}>Location</label><LocationInput className={inputCls} placeholder="City or Airport" value={form.location} onChange={(v) => { setError(''); setForm(p => ({...p, location: v})) }} /></div>
        <div><label className={labelCls}>Pickup</label><input type="date" className={inputCls} min={today()} value={form.pickup} onChange={set('pickup')} /></div>
        <div><label className={labelCls}>Return</label><input type="date" className={inputCls} min={form.pickup || today()} value={form.returnDate} onChange={set('returnDate')} /></div>
        <div>
          <label className={labelCls}>Availability</label>
          <select className={inputCls} value={form.available} onChange={set('available')}>
            <option value="true">Available Only</option>
            <option value="">All Vehicles</option>
          </select>
        </div>
      </div>
      <button type="submit" className="mt-3 w-full bg-orange text-white font-semibold text-sm py-3 rounded-xl hover:bg-orange/90 transition-colors">Update Search</button>
      </form>
      {error && <div className="absolute top-full left-0 mt-2 w-full text-center text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl border border-red-100 shadow-sm z-40">{error}</div>}
    </div>
  )

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-6 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          <label className={labelCls}>📍 Pickup Location</label>
          <LocationInput className={inputCls} placeholder="City or Airport" value={form.location} onChange={(v) => { setError(''); setForm(p => ({...p, location: v})) }} required />
        </div>
        <div>
          <label className={labelCls}>📅 Pickup Date</label>
          <input type="date" className={inputCls} min={today()} value={form.pickup} onChange={set('pickup')} required />
        </div>
        <div>
          <label className={labelCls}>📅 Return Date</label>
          <input type="date" className={inputCls} min={form.pickup || today()} value={form.returnDate} onChange={set('returnDate')} required />
        </div>
        <div>
          <label className={labelCls}>🚗 Availability</label>
          <select className={inputCls} value={form.available} onChange={set('available')}>
            <option value="true">Available Only</option>
            <option value="">All Vehicles</option>
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary mt-6 w-full bg-orange text-white font-semibold text-base py-3.5 rounded-xl hover:bg-orange/90 tracking-wide">
        Search Available Cars
      </button>
      {error && <div className="mt-4 text-center text-red-500 text-sm bg-red-50 py-2.5 rounded-xl border border-red-100">{error}</div>}
    </form>
  )
}
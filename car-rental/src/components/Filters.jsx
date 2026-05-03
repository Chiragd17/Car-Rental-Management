import React from 'react'

const VEHICLE_TYPES = ['SUV', 'Sedan', 'MUV', 'EV']
const CONDITIONS    = ['Excellent', 'Good', 'Fair', 'Poor']
const PRICE_BANDS   = [
  { label: 'Under ₹2,000',      max: 2000   },
  { label: '₹2,000 – ₹5,000',  max: 5000   },
  { label: '₹5,000 – ₹10,000', max: 10000  },
  { label: 'Above ₹10,000',     max: 999999 },
]

export default function Filters({ filters, setFilters }) {
  const toggle = (k, v) => setFilters((p) => ({ ...p, [k]: p[k] === v ? '' : v }))
  const clear  = () => setFilters({ vehicleType: '', condition: '', maxPrice: '', available: 'true' })

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base text-forest">Filters</h3>
        <button onClick={clear} className="text-xs text-orange hover:underline">Clear all</button>
      </div>

      {/* Availability */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Availability</p>
        {[{ label: '✅ Available Only', v: 'true' }, { label: '🚗 All Vehicles', v: '' }].map(({ label, v }) => (
          <button key={label} onClick={() => setFilters((p) => ({ ...p, available: v }))}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border mb-2 transition-all
              ${filters.available === v ? 'bg-orange/10 border-orange/30 text-orange' : 'border-gray-100 text-forest hover:border-orange/20'}`}>
            {label}
            {filters.available === v && <span>✓</span>}
          </button>
        ))}
      </div>

      {/* Vehicle Type */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Vehicle Type</p>
        {VEHICLE_TYPES.map((t) => (
          <button key={t} onClick={() => toggle('vehicleType', t)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border mb-2 transition-all
              ${filters.vehicleType === t ? 'bg-orange/10 border-orange/30 text-orange' : 'border-gray-100 text-forest hover:border-orange/20'}`}>
            {t === 'SUV' ? '🚙' : t === 'Sedan' ? '🚗' : t === 'MUV' ? '🚐' : '⚡'} {t}
            {filters.vehicleType === t && <span>✓</span>}
          </button>
        ))}
      </div>

      {/* Condition */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Condition</p>
        {CONDITIONS.map((c) => (
          <button key={c} onClick={() => toggle('condition', c)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border mb-2 transition-all
              ${filters.condition === c ? 'bg-orange/10 border-orange/30 text-orange' : 'border-gray-100 text-forest hover:border-orange/20'}`}>
            {c}
            {filters.condition === c && <span>✓</span>}
          </button>
        ))}
      </div>

      {/* Price */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Max Price / Day</p>
        {PRICE_BANDS.map(({ label, max }) => (
          <button key={label} onClick={() => toggle('maxPrice', max)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border mb-2 transition-all
              ${filters.maxPrice === max ? 'bg-orange/10 border-orange/30 text-orange' : 'border-gray-100 text-forest hover:border-orange/20'}`}>
            {label}
            {filters.maxPrice === max && <span>✓</span>}
          </button>
        ))}
      </div>
    </aside>
  )
}
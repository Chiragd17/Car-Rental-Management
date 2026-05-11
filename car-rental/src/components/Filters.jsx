import React from 'react'

const VEHICLE_TYPES = ['SUV', 'Sedan', 'MUV', 'EV']
const CONDITIONS    = ['Excellent', 'Good', 'Fair', 'Poor']
export const PRICE_BANDS   = [
  { id: 't1', label: 'Under ₹2,000',      min: 0, max: 2000   },
  { id: 't2', label: '₹2,000 – ₹5,000',  min: 2000, max: 5000   },
  { id: 't3', label: '₹5,000 – ₹10,000', min: 5000, max: 10000  },
  { id: 't4', label: 'Above ₹10,000',     min: 10000, max: 9999999 },
]

export default function Filters({ filters, setFilters }) {
  const toggle = (k, v) => setFilters((p) => ({ ...p, [k]: p[k] === v ? '' : v }))
  const clear  = () => setFilters({ vehicleType: '', condition: '', priceBand: '', available: 'true' })

  return (
    <aside className="filters-sidebar bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
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
        {PRICE_BANDS.map(({ label, id }) => (
          <button key={label} onClick={() => toggle('priceBand', id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border mb-2 transition-all
              ${filters.priceBand === id ? 'bg-orange/10 border-orange/30 text-orange' : 'border-gray-100 text-forest hover:border-orange/20'}`}>
            {label}
            {filters.priceBand === id && <span>✓</span>}
          </button>
        ))}
      </div>
    </aside>
  )
}
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, conditionColor } from '../utils/helpers'

const CAR_IMAGES = [
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
]

const typeIcon = (t) => ({ SUV: '🚙', Sedan: '🚗', MUV: '🚐', EV: '⚡' }[t] || '🚗')

const getImage = (id) => CAR_IMAGES[id % CAR_IMAGES.length]

export default function CarCard({ vehicle, searchParams = {} }) {
  const { requireAuth } = useAuth()
  const navigate = useNavigate()

  const { vehicle_id, model, daily_price, condition, availability, plate_no, mileage, vehicle_type } = vehicle

  const handleBook = () => {
    requireAuth(() => navigate('/booking', { state: { vehicle, searchParams } }))
  }

  return (
    <div className="car-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={getImage(vehicle_id)} alt={model}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.target.src = CAR_IMAGES[0] }} />
        {!availability && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm px-3 py-1 bg-black/40 rounded-full">Unavailable</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {vehicle_type && (
            <span className="chip bg-forest/80 text-white text-xs font-semibold">
              {typeIcon(vehicle_type)} {vehicle_type}
            </span>
          )}
          <span className={`chip text-xs font-semibold ${conditionColor(condition)}`}>{condition}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-lg text-forest leading-tight">{model}</h3>
        <p className="text-xs text-gray-400 mt-1 font-mono">{plate_no}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {mileage !== undefined && (
            <span className="chip">🛣️ {Number(mileage).toLocaleString('en-IN')} km</span>
          )}
          <span className={`chip ${availability ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {availability ? '✅ Available' : '❌ Booked'}
          </span>
        </div>

        <div className="mt-auto pt-5 flex items-end justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-forest">{formatCurrency(daily_price)}</span>
            <span className="text-xs text-gray-400 ml-1">/ day</span>
          </div>
          <button onClick={handleBook} disabled={!availability}
            className="btn-primary bg-orange text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed">
            Book Car
          </button>
        </div>
      </div>
    </div>
  )
}
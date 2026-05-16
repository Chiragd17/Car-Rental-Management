import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, conditionColor } from '../utils/helpers'

const CAR_IMAGES = [
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { vehicle_id, model, daily_price, condition, availability, plate_no, mileage, vehicle_type, image_url, location } = vehicle

  const handleBook = (e) => {
    e.stopPropagation() // Prevent card expansion toggle when clicking book
    requireAuth(() => navigate('/booking', { state: { vehicle, searchParams } }))
  }

  const getFinalImageUrl = (url, id) => {
    if (!url) return getImage(id);
    if (url.startsWith('http')) return url;
    return `/cars/${url}?v=2`;
  };

  return (
    <>
      <div 
        className="car-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col cursor-pointer hover:shadow-lg hover:border-orange/20 transition-all duration-300"
        onClick={() => setIsDrawerOpen(true)}
      >
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img src={getFinalImageUrl(image_url, vehicle_id)} alt={model}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => { e.target.src = CAR_IMAGES[0] }} />
          {!availability && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm px-3 py-1 bg-black/40 rounded-full">Unavailable</span>
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex gap-1.5 transition-opacity duration-300">
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
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-400 font-mono">{plate_no}</p>
            {location && (
              <span className="text-xs font-semibold text-forest/70 w-fit bg-cream px-2 py-0.5 rounded-md border border-gray-100 flex items-center gap-1 max-w-[150px] truncate" title={location}>
                📍 {location}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {mileage !== undefined && (
              <span className="chip text-xs">🛣️ {Number(mileage).toLocaleString('en-IN')} km</span>
            )}
            <span className={`w-fit chip ${availability ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
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

      {/* DRAWER / SIDEBAR (40% width from right) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-[85%] md:w-[40%] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-y-auto">
            <div className="p-6">
              <button 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10"
                onClick={() => setIsDrawerOpen(false)}
              >
                ×
              </button>
              
              <h2 className="text-2xl font-display font-bold text-forest mb-6 pr-8">{model} — Details</h2>
              
              <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                <img src={getFinalImageUrl(image_url, vehicle_id)} className="w-full h-full object-cover" alt={model} 
                     onError={(e) => { e.target.src = CAR_IMAGES[0] }} />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className={`chip text-xs font-semibold ${conditionColor(condition)}`}>{condition} condition</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Available Locations */}
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Available Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {location ? location.split(',').map(l => l.trim()).map((loc, idx) => (
                      <span key={idx} className="bg-cream text-forest/80 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-100">
                        📍 {loc}
                      </span>
                    )) : <span className="text-gray-500 text-sm">Not specified</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Plate No.</p>
                    <p className="text-forest font-bold font-mono">{plate_no}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Vehicle Type</p>
                    <p className="text-forest font-bold flex items-center gap-1.5">{typeIcon(vehicle_type)} {vehicle_type}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Mileage</p>
                    <p className="text-forest font-bold">{Number(mileage).toLocaleString('en-IN')} km</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                    <p className={`font-bold ${availability ? 'text-green-600' : 'text-red-600'}`}>
                      {availability ? 'Available' : 'Currently Booked'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Pricing Rate</p>
                  <p className="text-3xl font-display font-bold text-orange">{formatCurrency(daily_price)} <span className="text-sm text-gray-400 font-sans font-normal">/ day</span></p>
                </div>
              </div>

              <div className="mt-8">
                <button onClick={handleBook} disabled={!availability}
                  className="w-full btn-primary bg-forest text-white text-base font-bold py-4 rounded-xl hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-forest/20">
                  {availability ? 'Proceed to Book' : 'Car Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
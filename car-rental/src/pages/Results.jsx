import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CarCard from '../components/CarCard'
import Filters, { PRICE_BANDS } from '../components/Filters'
import SearchBar from '../components/SearchBar'
import { getVehicles } from '../services/api'

export default function Results() {
  const [searchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const [filters, setFilters] = useState({
    vehicleType: searchParams.get('vehicleType') ?? '',
    condition:   searchParams.get('condition') ?? '',
    priceBand:   searchParams.get('priceBand') ?? '',
    available:   searchParams.get('available') ?? 'true',
  })

  const spObj = Object.fromEntries(searchParams.entries())

  useEffect(() => {
    const fetch = async () => {
      setLoading(true); setError('')
      try {
        const params = {}
        if (filters.available === 'true') params.available = 'true'
        if (spObj.location) params.location = spObj.location.split(' - ')[0]
        const res = await getVehicles(params)
        setVehicles(res.data || res)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [filters.available, spObj.location])

  // Client-side filters
  const displayed = vehicles.filter((v) => {
    if (filters.vehicleType && v.vehicle_type !== filters.vehicleType) return false
    if (filters.condition   && v.condition    !== filters.condition)   return false
    if (filters.priceBand) {
      const band = PRICE_BANDS.find(b => b.id === filters.priceBand)
      const price = Number(v.daily_price)
      if (band && (price < band.min || price > band.max)) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <SearchBar compact initialValues={{ location: spObj.location, pickup: spObj.pickup, returnDate: spObj.returnDate, available: spObj.available }} />
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Filters filters={filters} setFilters={setFilters} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-2xl text-forest">
                {loading ? 'Loading vehicles…' : (
                  <><span className="font-sans font-bold">{displayed.length}</span> vehicle{displayed.length !== 1 ? 's' : ''} found</>
                )}
              </h2>
              {spObj.location && (
                <span className="text-sm text-gray-500">
                  📍 {spObj.location}
                  {spObj.pickup     && ` · ${spObj.pickup}`}
                  {spObj.returnDate && ` → ${spObj.returnDate}`}
                </span>
              )}
            </div>

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-100" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-100 rounded w-2/3" />
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-10 bg-gray-100 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">😕</div>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && displayed.length === 0 && (
              <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="text-6xl mb-4">🏙️</div>
                <h3 className="font-display text-2xl text-forest font-bold">No vehicles currently available</h3>
                <p className="text-gray-400 mt-2 max-w-sm mx-auto mb-8">We couldn't find any vehicles in {spObj.location ? spObj.location.split(' - ')[0] : 'this area'} matching your criteria. Try adjusting your filters or changing the location.</p>
                <button 
                  onClick={() => window.location.href = '/results'}
                  className="bg-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange/90 transition-colors shadow-sm">
                  View All Available Vehicles
                </button>
              </div>
            )}

            {!loading && displayed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayed.map((v) => (
                  <CarCard key={v.vehicle_id} vehicle={v} searchParams={spObj} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
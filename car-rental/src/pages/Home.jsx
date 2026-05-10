import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import CarCard from '../components/CarCard'
import { getVehicles } from '../services/api'

const STATS = [
  { value: '500+', label: 'Vehicles'  },
  { value: '50+',  label: 'Cities'    },
  { value: '4.9★', label: 'Rating'    },
  { value: '24/7', label: 'Support'   },
]

const CATEGORIES = [
  { icon: '✅', label: 'Available Now',  params: { available: 'true' } },
  { icon: '🏆', label: 'Top Condition',  params: { condition: 'Excellent' } },
  { icon: '💰', label: 'Budget Picks',   params: { priceBand: 't1' } },
  { icon: '🚗', label: 'All Vehicles',   params: {} },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose Location', desc: 'Select your pickup city and travel dates.' },
  { step: '02', title: 'Pick a Vehicle', desc: 'Browse our premium fleet and find your perfect ride.' },
  { step: '03', title: 'Hit the Road', desc: 'Pick up the keys and enjoy a seamless driving experience.' },
]

const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Business Traveler', text: 'The best car rental experience I have ever had. The car was spotless and the process was incredibly fast.', rating: 5 },
  { name: 'Priya Patel', role: 'Weekend Explorer', text: 'Loved the smooth booking process. DriveElite made our family weekend getaway absolutely perfect!', rating: 5 },
  { name: 'Amit Kumar', role: 'Daily Commuter', text: 'Highly recommend! Great customer service and a fantastic selection of well-maintained vehicles.', rating: 4 },
]

export default function Home() {
  const navigate = useNavigate()
  const [featuredCars, setFeaturedCars] = useState([])

  useEffect(() => {
    getVehicles().then(res => {
      // Get 3 random or top cars
      if (res.data) setFeaturedCars(res.data.slice(0, 3))
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=85')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/60 to-forest/90" />

        <div className="relative z-10 text-center px-6 mb-10 mt-16">
          <span className="inline-block text-orange font-semibold text-sm tracking-[0.2em] uppercase mb-4 opacity-90">Premium Experience</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl mx-auto">
            Drive in <span className="text-orange italic">Style,</span><br />Wherever You Go
          </h1>
          <p className="text-white/60 text-lg mt-6 max-w-xl mx-auto leading-relaxed">
            Handpicked premium vehicles, seamless bookings, and world-class service — all in one platform.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6">
          <SearchBar />
        </div>

        <div className="relative z-10 mt-12 flex items-center gap-8 md:gap-16 px-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display font-bold text-2xl text-white">{value}</div>
              <div className="text-white/50 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs">
          <span>Scroll</span><div className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-forest">Browse by Category</h2>
            <p className="text-gray-500 mt-2 text-sm">Find the perfect car for every journey</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(({ icon, label, params }) => (
              <button key={label} onClick={() => navigate(`/results?${new URLSearchParams(params)}`)}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-orange/30 hover:shadow-lg transition-all group">
                <div className="text-3xl mb-4">{icon}</div>
                <div className="font-semibold text-forest text-base group-hover:text-orange transition-colors">{label}</div>
                <div className="text-xs text-gray-400 mt-2">Explore →</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-forest">How It Works</h2>
            <p className="text-gray-500 mt-2 text-sm">Your dream ride is just a few clicks away</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 mx-auto bg-orange/10 text-orange rounded-2xl flex items-center justify-center font-display font-bold text-2xl mb-6">
                  {step}
                </div>
                <h3 className="font-display font-bold text-forest text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles (Dynamic) */}
      {featuredCars.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h2 className="font-display text-3xl font-bold text-forest">Featured Fleet</h2>
                <p className="text-gray-500 mt-2 text-sm">Top rated premium vehicles</p>
              </div>
              <button onClick={() => navigate('/results')} className="text-orange font-semibold text-sm hover:underline hidden md:block">
                View All Vehicles →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCars.map(car => <CarCard key={car.vehicle_id} vehicle={car} />)}
            </div>
            <button onClick={() => navigate('/results')} className="w-full mt-8 py-3 rounded-xl border border-orange text-orange font-semibold hover:bg-orange/5 transition-colors md:hidden">
              View All Vehicles
            </button>
          </div>
        </section>
      )}

      {/* Why DriveElite */}
      <section className="py-20 px-6 bg-forest">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-white">Why DriveElite?</h2>
            <p className="text-white/60 mt-2 text-sm">Experience the best in class service</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🛡️', title: 'Fully Insured',       desc: 'Every rental includes comprehensive coverage options for complete peace of mind.' },
              { icon: '⚡', title: 'Instant Booking',      desc: 'Book your vehicle in under 2 minutes with our streamlined and secure checkout.' },
              { icon: '📍', title: '50+ Locations',        desc: 'Conveniently placed across major airports, railway stations and city centres.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-6">{icon}</div>
                <h3 className="font-display font-bold text-white text-xl mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-forest">What Our Clients Say</h2>
            <p className="text-gray-500 mt-2 text-sm">Trusted by thousands of happy travelers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-orange text-lg mb-4">{'★'.repeat(t.rating)}</div>
                <p className="text-gray-600 text-sm italic leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <h4 className="font-display font-bold text-forest">{t.name}</h4>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-forest border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-orange to-orange/80" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Ready to hit the road?</h2>
          <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">Join DriveElite today and experience premium car rentals like never before.</p>
          <button onClick={() => navigate('/results')} className="bg-white text-orange font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Browse Our Fleet Now
          </button>
        </div>
      </section>
    </div>
  )
}
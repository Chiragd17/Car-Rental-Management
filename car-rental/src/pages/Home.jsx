import React from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'

const STATS = [
  { value: '500+', label: 'Vehicles'  },
  { value: '50+',  label: 'Cities'    },
  { value: '4.9★', label: 'Rating'    },
  { value: '24/7', label: 'Support'   },
]

const CATEGORIES = [
  { icon: '✅', label: 'Available Now',  params: { available: 'true' } },
  { icon: '🏆', label: 'Top Condition',  params: { condition: 'Excellent' } },
  { icon: '💰', label: 'Budget Picks',   params: { maxPrice: '2000' } },
  { icon: '🚗', label: 'All Vehicles',   params: {} },
]

export default function Home() {
  const navigate = useNavigate()

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
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-forest">Browse by Category</h2>
            <p className="text-gray-500 mt-2 text-sm">Find the perfect car for every journey</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(({ icon, label, params }) => (
              <button key={label} onClick={() => navigate(`/results?${new URLSearchParams(params)}`)}
                className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-orange/30 hover:shadow-md transition-all group">
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-semibold text-forest text-sm group-hover:text-orange transition-colors">{label}</div>
                <div className="text-xs text-gray-400 mt-1">Browse fleet →</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why DriveElite */}
      <section className="py-16 px-6 bg-forest">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white">Why DriveElite?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Fully Insured',       desc: 'Every rental includes comprehensive coverage options for peace of mind.' },
              { icon: '⚡', title: 'Instant Booking',      desc: 'Book your vehicle in under 2 minutes with our streamlined checkout.' },
              { icon: '📍', title: '50+ Pickup Locations', desc: 'Conveniently placed across airports, railway stations and city centres.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-display font-bold text-white text-lg">{title}</h3>
                <p className="text-white/50 text-sm mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
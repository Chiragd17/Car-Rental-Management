import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Authcontext'
import { getMe, updateMe } from '../services/api'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profile,  setProfile]  = useState(null)
  const [editing,  setEditing]  = useState(false)
  const [form,     setForm]     = useState({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  useEffect(() => {
    if (!user) { navigate('/'); return }
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await getMe()
        setProfile(res.data)
        setForm(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user, navigate])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      await updateMe({
        first_name:      form.first_name,
        last_name:       form.last_name,
        contact_no:      form.contact_no,
        nationality:     form.nationality || 'Indian',
        govt_id_type:    form.govt_id_type || 'Aadhaar',
        govt_id_number:  form.govt_id_number,
        driving_license: form.driving_license,
        house_no:        form.house_no,
        city:            form.city,
        country:         form.country,
      })
      setProfile(form)
      setEditing(false)
      setSuccess('Profile updated!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => { await logout(); navigate('/') }

  const maskId = (type, value) => {
    if (!value) return '—'
    const v = String(value).toUpperCase()
    if (type === 'Aadhaar') return 'XXXX XXXX ' + v.slice(-4)
    if (type === 'PAN Card') return v.slice(0, 5) + '****' + v.slice(-1)
    if (type === 'Passport') return v.slice(0, 3) + '****' + v.slice(-2)
    if (type === 'Driving License') return v.slice(0, 2) + '****' + v.slice(-3)
    return v.slice(0, 2) + '****' + v.slice(-2) // fallback
  }

  const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-forest
    focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all`
  const labelCls = 'block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5'

  const initial = user?.email?.[0]?.toUpperCase()
  const isKycVerified = profile?.govt_id_number && profile?.driving_license;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-forest mb-8">My Profile</h1>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-orange/15 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-display font-bold text-orange">{initial}</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-5 bg-gray-100 rounded w-1/3 mx-auto" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-xl text-forest flex items-center justify-center gap-2">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
              
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {isKycVerified ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-4 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 shadow-sm">
                      KYC VERIFIED ✅
                    </span>
                    <button onClick={() => { setEditing(true); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} className="inline-flex items-center gap-1 text-xs font-bold px-4 py-1.5 bg-white text-orange rounded-full border border-orange/20 shadow-sm hover:bg-orange/5 transition-colors cursor-pointer">
                      Update KYC
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setEditing(true); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} className="inline-flex items-center gap-1 text-xs font-bold px-4 py-1.5 bg-orange text-white rounded-full shadow-sm hover:bg-orange/90 transition-colors cursor-pointer">
                    Complete KYC Now
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Profile details / edit form */}
        {!loading && profile && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-forest">Account Details</h3>
              <button onClick={() => { setEditing(!editing); setSuccess('') }}
                className="text-sm text-orange hover:underline">
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>First Name</label><input className={inputCls} value={form.first_name || ''} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Last Name</label><input className={inputCls} value={form.last_name || ''} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} /></div>
                </div>
                <div><label className={labelCls}>Contact No</label><input className={inputCls} value={form.contact_no || ''} onChange={(e) => setForm((p) => ({ ...p, contact_no: e.target.value }))} /></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nationality</label>
                    <select className={inputCls} value={form.nationality || 'Indian'} onChange={(e) => {
                      const newNat = e.target.value;
                      let newType = form.govt_id_type || 'Aadhaar';
                      let newNum = form.govt_id_number;
                      if (newNat === 'Foreigner' && newType !== 'Passport') {
                        newType = 'Passport';
                        newNum = '';
                      } else if (newNat === 'Indian' && newType === 'Passport') {
                        newType = 'Aadhaar';
                        newNum = '';
                      }
                      setForm((p) => ({ ...p, nationality: newNat, govt_id_type: newType, govt_id_number: newNum }));
                    }}>
                      <option value="Indian">Indian</option>
                      <option value="Foreigner">Foreigner</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Govt ID Type</label>
                    <select className={inputCls} value={form.govt_id_type || 'Aadhaar'} onChange={(e) => setForm((p) => ({ ...p, govt_id_type: e.target.value, govt_id_number: '' }))}>
                      {form.nationality === 'Foreigner' ? (
                        <option value="Passport">Passport</option>
                      ) : (
                        <>
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="PAN Card">PAN Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Passport">Passport</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>{form.govt_id_type || 'Govt ID'} Number</label>
                  <input 
                    className={inputCls} 
                    maxLength={
                      (form.govt_id_type || 'Aadhaar') === 'Aadhaar' ? 12 : 
                      (form.govt_id_type || 'Aadhaar') === 'PAN Card' ? 10 : 
                      (form.govt_id_type || 'Aadhaar') === 'Passport' ? 9 : 10
                    }
                    value={form.govt_id_number || ''} 
                    onChange={(e) => {
                      let val = e.target.value.toUpperCase();
                      const type = form.govt_id_type || 'Aadhaar';
                      if (type === 'Aadhaar') {
                        val = val.replace(/[^0-9]/g, '');
                      } else {
                        val = val.replace(/[^A-Z0-9]/g, '');
                      }
                      setForm((p) => ({ ...p, govt_id_number: val }));
                    }} 
                  />
                </div>
                
                <div><label className={labelCls}>Driving Licence</label><input className={inputCls} value={form.driving_license || ''} onChange={(e) => setForm((p) => ({ ...p, driving_license: e.target.value }))} /></div>
                <div><label className={labelCls}>House No / Street</label><input className={inputCls} value={form.house_no || ''} onChange={(e) => setForm((p) => ({ ...p, house_no: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>City</label><input className={inputCls} value={form.city || ''} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} /></div>
                  <div><label className={labelCls}>Country</label><input className={inputCls} value={form.country || ''} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} /></div>
                </div>
                {error   && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <button type="submit" disabled={saving}
                  className="w-full bg-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-orange/90 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {[
                  ['Name',     `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '—'],
                  ['Contact',  profile.contact_no      || '—'],
                  ['Nationality', profile.nationality  || '—'],
                  ['ID Type',  profile.govt_id_type    || '—'],
                  ['ID Number', maskId(profile.govt_id_type, profile.govt_id_number)],
                  ['Licence',  maskId('Driving License', profile.driving_license)],
                  ['House No', profile.house_no        || '—'],
                  ['City',     profile.city            || '—'],
                  ['Country',  profile.country         || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-medium text-forest">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={() => navigate('/bookings')}
            className="w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-2xl hover:border-orange/20 transition-all group">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span className="font-medium text-forest text-sm">My Bookings</span>
            </div>
            <span className="text-gray-300 group-hover:text-orange transition-colors">→</span>
          </button>

          <button onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-2xl hover:border-red-100 hover:bg-red-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚪</span>
              <span className="font-medium text-red-500 text-sm">Sign Out</span>
            </div>
            <span className="text-gray-300 group-hover:text-red-400 transition-colors">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
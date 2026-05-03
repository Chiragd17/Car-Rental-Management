import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe, updateMe } from '../services/api'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // customer fields from customerModel: first_name, last_name, contact_no, driving_license, city, country, house_no
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
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      await updateMe({
        first_name:      form.first_name,
        last_name:       form.last_name,
        contact_no:      form.contact_no,
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

  const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-forest
    focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all`
  const labelCls = 'block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5'

  const initial = user?.email?.[0]?.toUpperCase()

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
              <h2 className="font-display font-bold text-xl text-forest">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
              {profile?.driving_license && (
                <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                  🪪 Licence: {profile.driving_license}
                </span>
              )}
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
                <div><label className={labelCls}>Driving Licence</label><input className={inputCls} value={form.driving_license || ''} onChange={(e) => setForm((p) => ({ ...p, driving_license: e.target.value }))} /></div>
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
                  ['Licence',  profile.driving_license || '—'],
                  ['City',     profile.city            || '—'],
                  ['Country',  profile.country         || '—'],
                  ['Member ID', `#${profile.cust_id}`],
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
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getDashboardStats,
  getAllVehicles,
  createVehicle,
  deleteVehicle,
  getAllEmployees,
  createEmployee,
} from '../services/adminApi'
import { formatCurrency, formatDate } from '../utils/helpers'

const TABS = ['Dashboard', 'Vehicles', 'Employees']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']
const VEHICLE_TYPES = ['SUV', 'Sedan', 'MUV', 'EV']
const RESPONSIBILITIES = ['Fleet Manager', 'Customer Support', 'Driver', 'Mechanic', 'Admin']

const EMPTY_VEHICLE = {
  plate_no: '', model: '', mileage: 0,
  daily_price: '', condition: 'Good',
  availability: true, vehicle_type: 'Sedan',
  registered_by: '', managed_by: '', image_url: '',
}

const EMPTY_EMPLOYEE = {
  first_name: '', last_name: '', salary: '',
  joined_date: '', responsibility: 'Fleet Manager',
  contact_no: '', house_no: '', city: '', country: '', manager_id: '',
}

function StatCard({ icon, label, value, sub, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange/10 text-orange',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="font-display font-bold text-3xl text-forest mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(21,43,33,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-display font-bold text-xl text-forest">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg">
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('Dashboard')
  const [stats, setStats] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE)
  const [employeeForm, setEmployeeForm] = useState(EMPTY_EMPLOYEE)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Access control — is_admin from MySQL
  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (isAdmin === false) { navigate('/'); return }
  }, [user, isAdmin])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError('')
      try {
        if (activeTab === 'Dashboard') {
          const res = await getDashboardStats()
          setStats(res.data)
        } else if (activeTab === 'Vehicles') {
          const [vRes, eRes] = await Promise.all([
             getAllVehicles(),
             getAllEmployees()
          ])
          setVehicles(vRes.data || [])
          setEmployees(eRes.data || [])
        } else if (activeTab === 'Employees') {
          const res = await getAllEmployees()
          setEmployees(res.data || [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeTab])

  const handleAddVehicle = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      const payload = { ...vehicleForm }
      payload.registered_by = payload.registered_by || null
      payload.managed_by = payload.managed_by || null
      await createVehicle(payload)
      setShowVehicleModal(false)
      setVehicleForm(EMPTY_VEHICLE)
      const res = await getAllVehicles()
      setVehicles(res.data || [])
    } catch (err) { setFormError(err.message) }
    finally { setFormLoading(false) }
  }

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return
    try {
      await deleteVehicle(id)
      setVehicles((p) => p.filter((v) => v.vehicle_id !== id))
    } catch (err) { alert(err.message) }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      await createEmployee({ ...employeeForm, manager_id: employeeForm.manager_id || null })
      setShowEmployeeModal(false)
      setEmployeeForm(EMPTY_EMPLOYEE)
      const res = await getAllEmployees()
      setEmployees(res.data || [])
    } catch (err) { setFormError(err.message) }
    finally { setFormLoading(false) }
  }

  const setV = (k) => (e) => setVehicleForm((p) => ({ ...p, [k]: e.target.value }))
  const setE = (k) => (e) => setEmployeeForm((p) => ({ ...p, [k]: e.target.value }))

  const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-forest
    focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all`
  const labelCls = 'block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1'

  return (
    <div className="min-h-screen bg-cream pt-20">

      {/* Header */}
      <div className="bg-forest text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange text-xs font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
              <h1 className="font-display text-3xl font-bold">DriveElite Dashboard</h1>
              <p className="text-white/50 text-sm mt-1">{user?.email}</p>
            </div>
            <button onClick={() => navigate('/')}
              className="text-sm px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-colors">
              ← Back to Site
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-white/10 rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-forest shadow-sm' : 'text-white/60 hover:text-white'
                  }`}>
                {tab === 'Dashboard' ? '📊' : tab === 'Vehicles' ? '🚗' : '👨‍💼'} {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-6">{error}</div>
        )}

        {/* ── DASHBOARD ── */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28" />
                ))}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatCard icon="🚗" label="Total Vehicles" value={stats.totalVehicles} color="orange" />
                  <StatCard icon="✅" label="Available" value={stats.availableVehicles} color="green"
                    sub={`${stats.totalVehicles - stats.availableVehicles} rented`} />
                  <StatCard icon="👥" label="Customers" value={stats.totalCustomers} color="blue" />
                  <StatCard icon="📋" label="Reservations" value={stats.totalReservations} color="purple"
                    sub={`${stats.cancelledReservations} cancelled`} />
                  <StatCard icon="💰" label="Total Revenue" value={formatCurrency(stats.totalRevenue)} color="green" />
                </div>

                {stats.topRentedVehicles?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-display font-bold text-xl text-forest mb-5">🏆 Top Rented Vehicles</h2>
                    <div className="space-y-3">
                      {stats.topRentedVehicles.map((v, i) => (
                        <div key={v.vehicle_id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-600' :
                              i === 1 ? 'bg-gray-100 text-gray-500' :
                                i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-cream text-forest'
                              }`}>{i + 1}</span>
                            <div>
                              <p className="font-semibold text-forest text-sm">{v.model}</p>
                              <p className="text-xs text-gray-400 font-mono">{v.plate_no}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-orange">{v.rent_count} rents</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: '🚗', label: 'Add Vehicle', action: () => { setActiveTab('Vehicles'); setTimeout(() => setShowVehicleModal(true), 300) } },
                    { icon: '👨‍💼', label: 'Add Employee', action: () => { setActiveTab('Employees'); setTimeout(() => setShowEmployeeModal(true), 300) } },
                    { icon: '📋', label: 'My Bookings', action: () => navigate('/bookings') },
                    { icon: '🏠', label: 'View Site', action: () => navigate('/') },
                  ].map(({ icon, label, action }) => (
                    <button key={label} onClick={action}
                      className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-orange/30 hover:shadow-md transition-all group">
                      <div className="text-2xl mb-2">{icon}</div>
                      <div className="font-semibold text-forest text-sm group-hover:text-orange transition-colors">{label}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── VEHICLES ── */}
        {activeTab === 'Vehicles' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-forest">
                Fleet Management
                {!loading && <span className="text-base font-normal text-gray-400 ml-2">({vehicles.length} vehicles)</span>}
              </h2>
              <button onClick={() => { setVehicleForm(EMPTY_VEHICLE); setFormError(''); setShowVehicleModal(true) }}
                className="bg-orange text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-orange/90 transition-colors">
                + Add Vehicle
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-16" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-gray-100">
                    <tr>
                      {['ID', 'Model', 'Plate No', 'Type', 'Condition', 'Daily Price', 'Mileage', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vehicles.map((v) => (
                      <tr key={v.vehicle_id} className="hover:bg-cream/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-400 text-xs">#{v.vehicle_id}</td>
                        <td className="px-4 py-3 font-semibold text-forest whitespace-nowrap">{v.model}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.plate_no}</td>
                        <td className="px-4 py-3"><span className="chip">{v.vehicle_type || '—'}</span></td>
                        <td className="px-4 py-3">
                          <span className={`chip text-xs ${v.condition === 'Excellent' ? 'bg-green-50 text-green-700' :
                            v.condition === 'Good' ? 'bg-blue-50 text-blue-700' :
                              v.condition === 'Fair' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'
                            }`}>{v.condition}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-forest">{formatCurrency(v.daily_price)}</td>
                        <td className="px-4 py-3 text-gray-500">{Number(v.mileage).toLocaleString('en-IN')} km</td>
                        <td className="px-4 py-3">
                          <span className={`chip text-xs ${v.availability ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                            {v.availability ? 'Available' : 'Booked'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteVehicle(v.vehicle_id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg border border-red-100 hover:bg-red-50 transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {vehicles.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">No vehicles found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── EMPLOYEES ── */}
        {activeTab === 'Employees' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-forest">
                Employee Management
                {!loading && <span className="text-base font-normal text-gray-400 ml-2">({employees.length} employees)</span>}
              </h2>
              <button onClick={() => { setEmployeeForm(EMPTY_EMPLOYEE); setFormError(''); setShowEmployeeModal(true) }}
                className="bg-orange text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-orange/90 transition-colors">
                + Add Employee
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-16" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-gray-100">
                    <tr>
                      {['ID', 'Name', 'Responsibility', 'Salary', 'Contact', 'Joined', 'Manager', 'City'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.map((emp) => (
                      <tr key={emp.emp_id} className="hover:bg-cream/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-400 text-xs">#{emp.emp_id}</td>
                        <td className="px-4 py-3 font-semibold text-forest whitespace-nowrap">{emp.first_name} {emp.last_name}</td>
                        <td className="px-4 py-3"><span className="chip">{emp.responsibility}</span></td>
                        <td className="px-4 py-3 font-semibold text-forest">{formatCurrency(emp.salary)}</td>
                        <td className="px-4 py-3 text-gray-500">{emp.contact_no}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(emp.joined_date)}</td>
                        <td className="px-4 py-3 text-gray-500">{emp.manager_name || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{emp.city || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {employees.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">No employees found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD VEHICLE MODAL */}
      {showVehicleModal && (
        <Modal title="Add New Vehicle" onClose={() => setShowVehicleModal(false)}>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Model *</label>
                <input className={inputCls} placeholder="e.g. Toyota Camry" value={vehicleForm.model} onChange={setV('model')} required />
              </div>
              <div>
                <label className={labelCls}>Plate No *</label>
                <input className={inputCls} placeholder="e.g. MH12AB1234" value={vehicleForm.plate_no} onChange={setV('plate_no')} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Image URL</label>
              <input className={inputCls} placeholder="e.g. 'thar.jpg' or 'https://...'" value={vehicleForm.image_url || ''} onChange={setV('image_url')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Daily Price (₹) *</label>
                <input type="number" className={inputCls} placeholder="e.g. 3500" value={vehicleForm.daily_price} onChange={setV('daily_price')} required />
              </div>
              <div>
                <label className={labelCls}>Mileage (km)</label>
                <input type="number" className={inputCls} placeholder="e.g. 15000" value={vehicleForm.mileage} onChange={setV('mileage')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Vehicle Type</label>
                <select className={inputCls} value={vehicleForm.vehicle_type} onChange={setV('vehicle_type')}>
                  {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Condition</label>
                <select className={inputCls} value={vehicleForm.condition} onChange={setV('condition')}>
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Registered By</label>
                <select className={inputCls} value={vehicleForm.registered_by} onChange={setV('registered_by')}>
                  <option value="">None</option>
                  {employees.map((emp) => (
                    <option key={emp.emp_id} value={emp.emp_id}>
                      #{emp.emp_id} — {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Managed By</label>
                <select className={inputCls} value={vehicleForm.managed_by} onChange={setV('managed_by')}>
                  <option value="">None</option>
                  {employees.map((emp) => (
                    <option key={emp.emp_id} value={emp.emp_id}>
                      #{emp.emp_id} — {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Availability</label>
              <select className={inputCls} value={vehicleForm.availability}
                onChange={(e) => setVehicleForm((p) => ({ ...p, availability: e.target.value === 'true' }))}>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
            {formError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowVehicleModal(false)}
                className="flex-1 border border-gray-200 text-forest font-semibold py-2.5 rounded-xl text-sm">
                Cancel
              </button>
              <button type="submit" disabled={formLoading}
                className="flex-1 bg-orange text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-orange/90 disabled:opacity-60">
                {formLoading ? 'Adding…' : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showEmployeeModal && (
        <Modal title="Add New Employee" onClose={() => setShowEmployeeModal(false)}>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>First Name *</label>
                <input className={inputCls} placeholder="First name" value={employeeForm.first_name} onChange={setE('first_name')} required />
              </div>
              <div>
                <label className={labelCls}>Last Name *</label>
                <input className={inputCls} placeholder="Last name" value={employeeForm.last_name} onChange={setE('last_name')} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Salary (₹) *</label>
                <input type="number" className={inputCls} placeholder="e.g. 35000" value={employeeForm.salary} onChange={setE('salary')} required />
              </div>
              <div>
                <label className={labelCls}>Contact No *</label>
                <input className={inputCls} placeholder="e.g. 9876543210" value={employeeForm.contact_no} onChange={setE('contact_no')} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Joined Date *</label>
                <input type="date" className={inputCls} value={employeeForm.joined_date} onChange={setE('joined_date')} required />
              </div>
              <div>
                <label className={labelCls}>Responsibility *</label>
                <select className={inputCls} value={employeeForm.responsibility} onChange={setE('responsibility')}>
                  {RESPONSIBILITIES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} placeholder="City" value={employeeForm.city} onChange={setE('city')} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input className={inputCls} placeholder="Country" value={employeeForm.country} onChange={setE('country')} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Manager (optional)</label>
              <select className={inputCls} value={employeeForm.manager_id} onChange={setE('manager_id')}>
                <option value="">No Manager</option>
                {employees.map((emp) => (
                  <option key={emp.emp_id} value={emp.emp_id}>
                    #{emp.emp_id} — {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
            {formError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEmployeeModal(false)}
                className="flex-1 border border-gray-200 text-forest font-semibold py-2.5 rounded-xl text-sm">
                Cancel
              </button>
              <button type="submit" disabled={formLoading}
                className="flex-1 bg-orange text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-orange/90 disabled:opacity-60">
                {formLoading ? 'Adding…' : 'Add Employee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
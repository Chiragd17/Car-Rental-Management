import axios from 'axios'

// Base URL matches app.js route mounting: /api/...
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Supabase JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// ── Auth ─────────────────────────────────────────────────────
// POST /api/auth/sync-user  → upsert MySQL customer from JWT
export const syncUser = (body = {}) =>
  api.post('/auth/sync-user', body).then((r) => r.data)

// GET /api/auth/profile
export const getProfile = () =>
  api.get('/auth/profile').then((r) => r.data)

// ── Customers ────────────────────────────────────────────────
// GET /api/customers/me
export const getMe = () =>
  api.get('/customers/me').then((r) => r.data)

// PUT /api/customers/me  — body: { first_name, last_name, contact_no, driving_license, ... }
export const updateMe = (body) =>
  api.put('/customers/me', body).then((r) => r.data)

// ── Vehicles ─────────────────────────────────────────────────
// GET /api/vehicles          — returns { success, count, data: [ vehicle, ... ] }
// vehicle fields: vehicle_id, plate_no, model, mileage, daily_price, condition, availability
export const getVehicles = (params = {}) =>
  api.get('/vehicles', { params }).then((r) => r.data)

// GET /api/vehicles/:id
export const getVehicle = (id) =>
  api.get(`/vehicles/${id}`).then((r) => r.data)

// ── Reservations ─────────────────────────────────────────────
// POST /api/reservations
// body: { vehicle_id, pickup_date, return_date, pickup_location }
export const createReservation = (body) =>
  api.post('/reservations', body).then((r) => r.data)

// GET /api/reservations/my
// returns reservations joined with vehicle: model, plate_no, daily_price, estimated_total, number_of_days
export const getMyReservations = () =>
  api.get('/reservations/my').then((r) => r.data)

// GET /api/reservations/:id
export const getReservation = (id) =>
  api.get(`/reservations/${id}`).then((r) => r.data)

// DELETE /api/reservations/:id  — body: { cancellation_details }
export const cancelReservation = (id, reason = 'Cancelled by customer') =>
  api.delete(`/reservations/${id}`, { data: { cancellation_details: reason } }).then((r) => r.data)

// ── Rents (Payments) ─────────────────────────────────────────
// POST /api/rents
// body: { reserve_id, pay_method, pay_date, down_payment, refund, damage_compensation }
// total_pay is auto-calculated by backend
export const createRent = (body) =>
  api.post('/rents', body).then((r) => r.data)

// GET /api/rents/my
export const getMyRents = () =>
  api.get('/rents/my').then((r) => r.data)

export default api
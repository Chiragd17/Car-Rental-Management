import api from './api'

// ── Dashboard Stats ───────────────────────────────────────────
// GET /api/dashboard/stats
export const getDashboardStats = () =>
  api.get('/dashboard/stats').then((r) => r.data)

// ── Vehicles ─────────────────────────────────────────────────
// GET /api/vehicles
export const getAllVehicles = (params = {}) =>
  api.get('/vehicles', { params }).then((r) => r.data)

// POST /api/vehicles
export const createVehicle = (body) =>
  api.post('/vehicles', body).then((r) => r.data)

// PUT /api/vehicles/:id
export const updateVehicle = (id, body) =>
  api.put(`/vehicles/${id}`, body).then((r) => r.data)

// DELETE /api/vehicles/:id
export const deleteVehicle = (id) =>
  api.delete(`/vehicles/${id}`).then((r) => r.data)

// ── Employees ─────────────────────────────────────────────────
// GET /api/employees
export const getAllEmployees = () =>
  api.get('/employees').then((r) => r.data)

// POST /api/employees
export const createEmployee = (body) =>
  api.post('/employees', body).then((r) => r.data)

// ── Rents / Damage Compensation ───────────────────────────────
// PUT /api/rents/by-reservation/:reserve_id/damage
export const addDamageCompensation = (reserveId, payload) =>
  api.put(`/rents/by-reservation/${reserveId}/damage`, payload).then((r) => r.data)

// ── Actions System ────────────────────────────────────────────
// PUT /api/reservations/:id/complete
export const markReservationCompleted = (id) =>
  api.put(`/reservations/${id}/complete`).then((r) => r.data)

// GET /api/customers/:id/history
export const getCustomerHistory = (custId) =>
  api.get(`/customers/${custId}/history`).then((r) => r.data)
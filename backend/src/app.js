// ──────────────────────────────────────────────────────────────
// app.js — Express Application Setup
// ──────────────────────────────────────────────────────────────
// This file:
//   1. Creates the Express app instance
//   2. Registers global middleware (cors, json parser)
//   3. Mounts all route modules under their base paths
//   4. Registers the global error handler LAST
//
// We keep app creation separate from server.listen() so that
// the app can be imported by test frameworks without starting
// a real HTTP server.
// ──────────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';

// ── Route modules ───────────────────────────────────────────
import authRoutes        from './routes/authRoutes.js';
import customerRoutes    from './routes/customerRoutes.js';
import vehicleRoutes     from './routes/vehicleRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import rentRoutes        from './routes/rentRoutes.js';
import employeeRoutes    from './routes/employeeRoutes.js';
import dashboardRoutes   from './routes/dashboardRoutes.js';

// ── Error handler ───────────────────────────────────────────
import errorHandler from './middleware/errorMiddleware.js';

const app = express();

// ─────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────────────────────

// Enable CORS for all origins (fine for dev; lock down in prod)
app.use(cors());

// Parse incoming JSON bodies (Content-Type: application/json)
app.use(express.json());

// Parse URL-encoded bodies (Content-Type: application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK — useful for uptime monitors & load balancers
// ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────
// MOUNT ROUTES — each file handles its own sub-paths
// ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🚗 Welcome to the Car Rental API! The server is running successfully.');
});

app.use('/api/auth',         authRoutes);
app.use('/api/customers',    customerRoutes);
app.use('/api/vehicles',     vehicleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/rents',        rentRoutes);
app.use('/api/employees',    employeeRoutes);
app.use('/api/dashboard',    dashboardRoutes);

// ─────────────────────────────────────────────────────────────
// 404 CATCH-ALL — for any route that doesn't match above
// ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER — must be registered LAST
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;

// ──────────────────────────────────────────────────────────────
// server.js — Application Entry Point
// ──────────────────────────────────────────────────────────────
// This is the file you run:  node src/server.js
//
// It does three things:
//   1. Loads environment variables from .env
//   2. Tests the MySQL connection
//   3. Starts the Express HTTP server
// ──────────────────────────────────────────────────────────────

import dotenv from 'dotenv';

// Load .env BEFORE importing anything that reads process.env
dotenv.config();

import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = process.env.PORT || 3000;

// ── Start-up sequence ───────────────────────────────────────
const startServer = async () => {
  try {
    // 1. Verify MySQL is reachable
    await testConnection();

    // 2. Start listening for HTTP requests
    app.listen(PORT, () => {
      console.log(`🚗  Car Rental API running → http://localhost:${PORT}`);
      console.log(`    Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1); // exit with failure code
  }
};

startServer();

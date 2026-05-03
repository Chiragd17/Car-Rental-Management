// ──────────────────────────────────────────────────────────────
// db.js — MySQL2 Connection Pool
// ──────────────────────────────────────────────────────────────
// We use a **connection pool** instead of a single connection so
// that multiple requests can query the database concurrently
// without blocking each other.  mysql2/promise gives us native
// async/await support — no callback hell!
// ──────────────────────────────────────────────────────────────

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create the pool — it opens connections lazily (on first query)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'car_rental_db',

  // Pool-specific settings
  waitForConnections: true,   // queue requests when all connections are busy
  connectionLimit:    10,     // max simultaneous connections
  queueLimit:         0,      // unlimited queue (0 = no limit)
});

// Quick connectivity check — called once at startup from server.js
export const testConnection = async () => {
  const connection = await pool.getConnection();
  console.log('✅  MySQL connected — thread id:', connection.threadId);
  connection.release(); // always release back to pool!
};

// Default export: the pool itself (used as `db.execute(...)`)
export default pool;

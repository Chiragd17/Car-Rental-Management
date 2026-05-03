// ──────────────────────────────────────────────────────────────
// reservationModel.js — SQL queries for the `reservation` table
// ──────────────────────────────────────────────────────────────

import db from '../config/db.js';

// ── Create a reservation (inside a transaction) ─────────────
// `connection` is a transactional connection from the pool
export const create = async (data, connection) => {
  const { reserve_date, pickup_date, return_date, pickup_location, cust_id, vehicle_id } = data;

  const [result] = await connection.execute(
    `INSERT INTO reservation
       (reserve_date, pickup_date, return_date, pickup_location, cust_id, vehicle_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [reserve_date, pickup_date, return_date, pickup_location, cust_id, vehicle_id]
  );
  return result;
};

// ── Find by PK ──────────────────────────────────────────────
export const findById = async (reserveId) => {
  const [rows] = await db.execute(
    `SELECT r.*, v.daily_price,
            (r.number_of_days * v.daily_price) AS estimated_total
     FROM reservation r
     JOIN vehicle v ON r.vehicle_id = v.vehicle_id
     WHERE r.reserve_id = ?`,
    [reserveId]
  );
  return rows[0];
};

// ── All reservations for a customer (with estimated total) ──
export const findByCustomerId = async (custId) => {
  const [rows] = await db.execute(
    `SELECT r.*, v.model, v.plate_no, v.daily_price,
            (r.number_of_days * v.daily_price) AS estimated_total
     FROM reservation r
     JOIN vehicle v ON r.vehicle_id = v.vehicle_id
     WHERE r.cust_id = ?
     ORDER BY r.reserve_date DESC`,
    [custId]
  );
  return rows;
};

// ── Update dates / location ─────────────────────────────────
export const update = async (reserveId, data) => {
  const { pickup_date, return_date, pickup_location } = data;

  const [result] = await db.execute(
    `UPDATE reservation
     SET pickup_date     = COALESCE(?, pickup_date),
         return_date     = COALESCE(?, return_date),
         pickup_location = COALESCE(?, pickup_location)
     WHERE reserve_id = ?`,
    [pickup_date ?? null, return_date ?? null, pickup_location ?? null, reserveId]
  );
  return result;
};

// ── Cancel (soft-cancel: store reason + restore vehicle) ────
// This runs inside a transaction via a controller-supplied connection
export const cancel = async (reserveId, cancellationDetails, connection) => {
  const [result] = await connection.execute(
    `UPDATE reservation
     SET cancellation_details = ?
     WHERE reserve_id = ?`,
    [cancellationDetails || 'Cancelled by customer', reserveId]
  );
  return result;
};

// ── Raw findById on a transactional connection ──────────────
export const findByIdRaw = async (reserveId, connection) => {
  const conn = connection || db;
  const [rows] = await conn.execute(
    'SELECT * FROM reservation WHERE reserve_id = ?',
    [reserveId]
  );
  return rows[0];
};

// ── Dashboard helpers ───────────────────────────────────────
export const countAll = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM reservation');
  return rows[0].total;
};

export const countCancelled = async () => {
  const [rows] = await db.execute(
    'SELECT COUNT(*) AS total FROM reservation WHERE cancellation_details IS NOT NULL'
  );
  return rows[0].total;
};

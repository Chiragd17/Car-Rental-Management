// ──────────────────────────────────────────────────────────────
// reservationModel.js — SQL queries for the `reservation` table
// ──────────────────────────────────────────────────────────────

import db from '../config/db.js';

// ── Create a reservation (inside a transaction) ─────────────
// `connection` is a transactional connection from the pool
export const create = async (data, connection) => {
  const { reserve_date, pickup_date, return_date, pickup_location, cust_id, vehicle_id, tax_percentage, tax_amount } = data;

  const [result] = await connection.execute(
    `INSERT INTO reservation
       (reserve_date, pickup_date, return_date, pickup_location, cust_id, vehicle_id, tax_percentage, tax_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [reserve_date, pickup_date, return_date, pickup_location, cust_id, vehicle_id, tax_percentage || 0, tax_amount || 0]
  );
  return result;
};

// ── Check Date Overlap ──────────────────────────────────────
export const checkOverlap = async (vehicleId, pickupDate, returnDate) => {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS count 
     FROM reservation 
     WHERE vehicle_id = ? 
       AND pickup_date <= ? 
       AND return_date >= ? 
       AND cancellation_details IS NULL`,
    [vehicleId, returnDate, pickupDate]
  );
  return rows[0].count > 0;
};

// ── Find by PK ──────────────────────────────────────────────
export const findById = async (reserveId) => {
  const [rows] = await db.execute(
    `SELECT r.*, v.daily_price,
            (r.number_of_days * v.daily_price) AS base_rent,
            (r.number_of_days * v.daily_price + r.tax_amount) AS estimated_total
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
            (r.number_of_days * v.daily_price) AS base_rent,
            (r.number_of_days * v.daily_price + r.tax_amount) AS estimated_total,
            rn.total_pay, rn.damage_compensation, rn.damage_description
     FROM reservation r
     JOIN vehicle v ON r.vehicle_id = v.vehicle_id
     LEFT JOIN rent rn ON r.reserve_id = rn.reserve_id
     WHERE r.cust_id = ?
     ORDER BY r.reserve_date DESC, r.reserve_id DESC`,
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
         pickup_location = COALESCE(?, pickup_location),
         tax_percentage  = COALESCE(?, tax_percentage),
         tax_amount      = COALESCE(?, tax_amount)
     WHERE reserve_id = ?`,
    [pickup_date ?? null, return_date ?? null, pickup_location ?? null, data.tax_percentage ?? null, data.tax_amount ?? null, reserveId]
  );
  return result;
};

// ── Cancel (soft-cancel: store reason, details, and refund info) ────
// This runs inside a transaction via a controller-supplied connection
export const cancel = async (reserveId, cancelData, connection) => {
  const {
    cancellation_details,
    cancellation_reason,
    refund_amount,
    refund_percentage,
  } = cancelData;

  const [result] = await connection.execute(
    `UPDATE reservation
     SET cancellation_details = ?,
         cancellation_reason  = ?,
         refund_amount        = ?,
         refund_percentage    = ?
     WHERE reserve_id = ?`,
    [
      cancellation_details || 'Cancelled by customer',
      cancellation_reason  || 'Not specified',
      refund_amount        ?? 0,
      refund_percentage    ?? 0,
      reserveId,
    ]
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

// ── Mark Reservation as Completed ─────────────────────────────
export const markCompleted = async (reserveId, connection) => {
  const conn = connection || db;
  const [result] = await conn.execute(
    `UPDATE reservation
     SET completed_at = NOW()
     WHERE reserve_id = ?`,
    [reserveId]
  );
  return result;
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

export const countActive = async () => {
  const [rows] = await db.execute(
    'SELECT COUNT(*) AS total FROM reservation WHERE pickup_date <= NOW() AND completed_at IS NULL AND cancellation_details IS NULL'
  );
  return rows[0].total;
};

export const getRecent = async (limit = 10) => {
  // We need to pass limit directly into the query string for mysql2 if not using named placeholders properly for LIMIT, 
  // but execute supports ? for LIMIT in mysql2. Let's use template literal just to be safe if `limit` is a number.
  const [rows] = await db.execute(
    `SELECT r.reserve_id, r.reserve_date, r.pickup_date, r.return_date, r.pickup_location, r.cancellation_details,
            r.cancellation_reason, r.refund_amount, r.refund_percentage, r.tax_percentage, r.tax_amount, r.completed_at,
            r.cust_id, c.first_name, c.last_name, c.email,
            v.model, v.vehicle_type, v.daily_price,
            (r.number_of_days * v.daily_price) AS base_rent,
            (r.number_of_days * v.daily_price + r.tax_amount) AS estimated_total,
            rn.total_pay, rn.damage_compensation, rn.damage_description
     FROM reservation r
     JOIN customer c ON r.cust_id = c.cust_id
     JOIN vehicle v ON r.vehicle_id = v.vehicle_id
     LEFT JOIN rent rn ON r.reserve_id = rn.reserve_id
     ORDER BY r.reserve_date DESC
     LIMIT ${Number(limit)}`
  );
  return rows;
};

export const getReservationsPerDay = async () => {
  const [rows] = await db.execute(
    `SELECT DATE(reserve_date) as date, COUNT(*) as count
     FROM reservation
     GROUP BY DATE(reserve_date)
     ORDER BY DATE(reserve_date) ASC
     LIMIT 30`
  );
  return rows;
};

export const getBookingsByVehicleType = async () => {
  const [rows] = await db.execute(
    `SELECT v.vehicle_type as name, COUNT(*) as value
     FROM reservation r
     JOIN vehicle v ON r.vehicle_id = v.vehicle_id
     GROUP BY v.vehicle_type`
  );
  return rows;
};

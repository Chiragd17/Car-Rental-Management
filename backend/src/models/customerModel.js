// ──────────────────────────────────────────────────────────────
// customerModel.js — SQL queries for the `customer` table
// ──────────────────────────────────────────────────────────────
// Each function runs a prepared statement (? placeholders) and
// returns the result rows.  No business logic lives here — that
// belongs in the controller.
// ──────────────────────────────────────────────────────────────

import db from '../config/db.js';

// ── Find a customer by their Supabase UUID ──────────────────
export const findBySupabaseUid = async (supabaseUid) => {
  const [rows] = await db.execute(
    'SELECT * FROM customer WHERE supabase_uid = ?',
    [supabaseUid]
  );
  return rows[0]; // undefined if not found
};

// ── Find a customer by their internal PK (cust_id) ─────────
export const findById = async (custId) => {
  const [rows] = await db.execute(
    'SELECT * FROM customer WHERE cust_id = ?',
    [custId]
  );
  return rows[0];
};

// ── Create or update customer on first login (upsert) ───────
// Uses ON DUPLICATE KEY UPDATE so that if the supabase_uid
// already exists, we just refresh the name fields.
export const upsert = async ({
  supabaseUid,
  firstName,
  lastName,
  email,
  contactNo = null,
  drivingLicense = null,
  houseNo = null,
  city = null,
  country = null
}) => {
  const [result] = await db.execute(
    `INSERT INTO customer
     (supabase_uid, first_name, last_name, email, contact_no, driving_license, house_no, city, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       first_name = COALESCE(VALUES(first_name), first_name),
       last_name  = COALESCE(VALUES(last_name), last_name),
       email      = VALUES(email)`,
    [
      supabaseUid,
      firstName,
      lastName,
      email,
      contactNo,
      drivingLicense,
      houseNo,
      city,
      country
    ]
  );

  return result;
};

// ── Update profile fields (only what the customer provides) ─
export const updateProfile = async (supabaseUid, fields) => {
  const {
    first_name,
    last_name,
    contact_no,
    driving_license,
    house_no,
    city,
    country,
  } = fields;

  const [result] = await db.execute(
    `UPDATE customer
     SET first_name      = COALESCE(?, first_name),
         last_name       = COALESCE(?, last_name),
         contact_no      = COALESCE(?, contact_no),
         driving_license = COALESCE(?, driving_license),
         house_no        = COALESCE(?, house_no),
         city            = COALESCE(?, city),
         country         = COALESCE(?, country)
     WHERE supabase_uid = ?`,
    [
      first_name  ?? null,
      last_name   ?? null,
      contact_no  ?? null,
      driving_license ?? null,
      house_no    ?? null,
      city        ?? null,
      country     ?? null,
      supabaseUid,
    ]
  );
  return result;
};

// ── Count total customers (used by dashboard) ───────────────
export const countAll = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM customer');
  return rows[0].total;
};

// ── Get Customer History ────────────────────────────────────
export const getHistory = async (custId) => {
  // Aggregate stats
  const [stats] = await db.execute(
    `SELECT 
       COUNT(r.reserve_id) as total_bookings,
       SUM(CASE WHEN r.cancellation_details IS NOT NULL THEN 1 ELSE 0 END) as cancellations,
       COALESCE(SUM(rn.total_pay), 0) as total_spent
     FROM reservation r
     LEFT JOIN rent rn ON r.reserve_id = rn.reserve_id
     WHERE r.cust_id = ?`,
    [custId]
  );

  // Favorite vehicle type
  const [favType] = await db.execute(
    `SELECT v.vehicle_type, COUNT(r.reserve_id) as count
     FROM reservation r
     JOIN vehicle v ON r.vehicle_id = v.vehicle_id
     WHERE r.cust_id = ?
     GROUP BY v.vehicle_type
     ORDER BY count DESC
     LIMIT 1`,
    [custId]
  );

  return {
    stats: stats[0] || { total_bookings: 0, cancellations: 0, total_spent: 0 },
    favorite_vehicle_type: favType[0]?.vehicle_type || 'None'
  };
};

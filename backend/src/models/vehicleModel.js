// ──────────────────────────────────────────────────────────────
// vehicleModel.js — SQL queries for the `vehicle` table
// ──────────────────────────────────────────────────────────────

import db from '../config/db.js';

// ── List all vehicles (optionally filter by availability) ───
export const findAll = async (availableOnly) => {
  let sql = 'SELECT * FROM vehicle';
  const params = [];

  if (availableOnly !== undefined) {
    sql += ' WHERE availability = ?';
    params.push(availableOnly ? 1 : 0);
  }

  sql += ' ORDER BY vehicle_id DESC';

  const [rows] = await db.execute(sql, params);
  return rows;
};

// ── Find one vehicle by PK ─────────────────────────────────
export const findById = async (vehicleId) => {
  const [rows] = await db.execute(
    'SELECT * FROM vehicle WHERE vehicle_id = ?',
    [vehicleId]
  );
  return rows[0];
};

// ── Create a new vehicle ────────────────────────────────────
export const create = async (data) => {
  const {
    plate_no,
    model,
    mileage,
    daily_price,
    condition,
    availability,
    registered_by,
    managed_by,
  } = data;

  const [result] = await db.execute(
    `INSERT INTO vehicle
       (plate_no, model, mileage, daily_price, \`condition\`, availability, registered_by, managed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      plate_no,
      model,
      mileage   ?? 0,
      daily_price,
      condition ?? 'Good',
      availability ?? true,
      registered_by ?? null,
      managed_by    ?? null,
    ]
  );
  return result;
};

// ── Update an existing vehicle ──────────────────────────────
export const update = async (vehicleId, data) => {
  const {
    plate_no,
    model,
    mileage,
    daily_price,
    condition,
    availability,
    registered_by,
    managed_by,
  } = data;

  const [result] = await db.execute(
    `UPDATE vehicle
     SET plate_no      = COALESCE(?, plate_no),
         model         = COALESCE(?, model),
         mileage       = COALESCE(?, mileage),
         daily_price   = COALESCE(?, daily_price),
         \`condition\` = COALESCE(?, \`condition\`),
         availability  = COALESCE(?, availability),
         registered_by = COALESCE(?, registered_by),
         managed_by    = COALESCE(?, managed_by)
     WHERE vehicle_id = ?`,
    [
      plate_no      ?? null,
      model         ?? null,
      mileage       ?? null,
      daily_price   ?? null,
      condition     ?? null,
      availability  ?? null,
      registered_by ?? null,
      managed_by    ?? null,
      vehicleId,
    ]
  );
  return result;
};

// ── Delete a vehicle ────────────────────────────────────────
export const remove = async (vehicleId) => {
  const [result] = await db.execute(
    'DELETE FROM vehicle WHERE vehicle_id = ?',
    [vehicleId]
  );
  return result;
};

// ── Toggle availability flag (used during reservation) ──────
export const setAvailability = async (vehicleId, available, connection) => {
  // Accept an optional connection for transactional use
  const conn = connection || db;
  const [result] = await conn.execute(
    'UPDATE vehicle SET availability = ? WHERE vehicle_id = ?',
    [available ? 1 : 0, vehicleId]
  );
  return result;
};

// ── Dashboard helpers ───────────────────────────────────────
export const countAll = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM vehicle');
  return rows[0].total;
};

export const countAvailable = async () => {
  const [rows] = await db.execute(
    'SELECT COUNT(*) AS total FROM vehicle WHERE availability = 1'
  );
  return rows[0].total;
};

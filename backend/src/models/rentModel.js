// ──────────────────────────────────────────────────────────────
// rentModel.js — SQL queries for the `rent` table
// ──────────────────────────────────────────────────────────────

import db from '../config/db.js';

// ── Create a rent (payment) record ──────────────────────────
export const create = async (data) => {
  const {
    pay_method,
    down_payment,
    refund,
    damage_compensation,
    total_pay,
    pay_date,
    cust_id,
    vehicle_id,
    reserve_id,
  } = data;

  const [result] = await db.execute(
    `INSERT INTO rent
       (pay_method, down_payment, refund, damage_compensation, total_pay, pay_date,
        cust_id, vehicle_id, reserve_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pay_method,
      down_payment  ?? 0,
      refund        ?? 0,
      damage_compensation ?? 0,
      total_pay,
      pay_date,
      cust_id,
      vehicle_id,
      reserve_id,
    ]
  );
  return result;
};

// ── Find by PK ──────────────────────────────────────────────
export const findById = async (rentId) => {
  const [rows] = await db.execute(
    `SELECT rn.*, r.pickup_date, r.return_date, r.number_of_days,
            v.model, v.plate_no, v.daily_price
     FROM rent rn
     JOIN reservation r ON rn.reserve_id = r.reserve_id
     JOIN vehicle v     ON rn.vehicle_id = v.vehicle_id
     WHERE rn.rent_id = ?`,
    [rentId]
  );
  return rows[0];
};

// ── Find rent record by reservation ID ──────────────────────
export const findByReserveId = async (reserveId, connection) => {
  const conn = connection || db;
  const [rows] = await conn.execute(
    `SELECT * FROM rent WHERE reserve_id = ?`,
    [reserveId]
  );
  return rows[0];
};

// ── Update the refund amount on a rent record ───────────────
export const updateRefund = async (rentId, refundAmount, connection) => {
  const conn = connection || db;
  const [result] = await conn.execute(
    `UPDATE rent SET refund = ? WHERE rent_id = ?`,
    [refundAmount, rentId]
  );
  return result;
};

// ── Update damage compensation and total pay on a rent record
export const updateDamage = async (reserveId, damageAmount, damageDescription, totalPay, connection) => {
  const conn = connection || db;
  const [result] = await conn.execute(
    `UPDATE rent 
     SET damage_compensation = ?, damage_description = ?, total_pay = ? 
     WHERE reserve_id = ?`,
    [damageAmount, damageDescription, totalPay, reserveId]
  );
  return result;
};

// ── All rent records for a customer ─────────────────────────
export const findByCustomerId = async (custId) => {
  const [rows] = await db.execute(
    `SELECT rn.*, r.pickup_date, r.return_date, r.number_of_days,
            v.model, v.plate_no, v.daily_price
     FROM rent rn
     JOIN reservation r ON rn.reserve_id = r.reserve_id
     JOIN vehicle v     ON rn.vehicle_id = v.vehicle_id
     WHERE rn.cust_id = ?
     ORDER BY rn.pay_date DESC`,
    [custId]
  );
  return rows;
};

// ── Dashboard: total revenue ────────────────────────────────
export const totalRevenue = async () => {
  const [rows] = await db.execute(
    'SELECT COALESCE(SUM(total_pay), 0) AS revenue FROM rent'
  );
  return rows[0].revenue;
};

export const revenueAnalytics = async () => {
  const [rows] = await db.execute(`
    SELECT 
      COALESCE(SUM(rn.total_pay), 0) AS revenue_including_tax,
      COALESCE(SUM(r.tax_amount), 0) AS total_tax_collected
    FROM rent rn
    JOIN reservation r ON rn.reserve_id = r.reserve_id
  `);
  return {
    revenue_including_tax: Number(rows[0].revenue_including_tax),
    total_tax_collected: Number(rows[0].total_tax_collected),
    revenue_excluding_tax: Number(rows[0].revenue_including_tax) - Number(rows[0].total_tax_collected)
  };
};

export const topRentedVehicles = async () => {
  const [rows] = await db.execute(
    `SELECT v.vehicle_id, v.model, v.plate_no, COUNT(*) AS rent_count
     FROM rent rn
     JOIN vehicle v ON rn.vehicle_id = v.vehicle_id
     GROUP BY v.vehicle_id, v.model, v.plate_no
     ORDER BY rent_count DESC
     LIMIT 5`
  );
  return rows;
};

export const countCompleted = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM reservation WHERE completed_at IS NOT NULL');
  return rows[0].total;
};

export const getRevenuePerDay = async () => {
  const [rows] = await db.execute(
    `SELECT DATE(pay_date) as date, SUM(total_pay) as revenue
     FROM rent
     GROUP BY DATE(pay_date)
     ORDER BY DATE(pay_date) ASC
     LIMIT 30`
  );
  return rows;
};

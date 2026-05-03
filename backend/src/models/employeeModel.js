// ──────────────────────────────────────────────────────────────
// employeeModel.js — SQL queries for the `employee` table
// ──────────────────────────────────────────────────────────────

import db from '../config/db.js';

// ── List all employees with manager name (self-JOIN) ────────
// LEFT JOIN because not every employee has a manager (top-level
// managers have manager_id = NULL).
export const findAll = async () => {
  const [rows] = await db.execute(
    `SELECT e.*,
            CONCAT(m.first_name, ' ', m.last_name) AS manager_name
     FROM employee e
     LEFT JOIN employee m ON e.manager_id = m.emp_id
     ORDER BY e.emp_id ASC`
  );
  return rows;
};

// ── Find one employee by PK ────────────────────────────────
export const findById = async (empId) => {
  const [rows] = await db.execute(
    `SELECT e.*,
            CONCAT(m.first_name, ' ', m.last_name) AS manager_name
     FROM employee e
     LEFT JOIN employee m ON e.manager_id = m.emp_id
     WHERE e.emp_id = ?`,
    [empId]
  );
  return rows[0];
};

// ── Create a new employee ───────────────────────────────────
export const create = async (data) => {
  const {
    first_name,
    last_name,
    salary,
    joined_date,
    responsibility,
    contact_no,
    house_no,
    city,
    country,
    manager_id,
  } = data;

  const [result] = await db.execute(
    `INSERT INTO employee
       (first_name, last_name, salary, joined_date, responsibility,
        contact_no, house_no, city, country, manager_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      salary,
      joined_date,
      responsibility,
      contact_no,
      house_no  ?? null,
      city      ?? null,
      country   ?? null,
      manager_id ?? null,
    ]
  );
  return result;
};

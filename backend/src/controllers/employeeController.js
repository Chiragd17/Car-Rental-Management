// ──────────────────────────────────────────────────────────────
// employeeController.js — Employee list & create
// ──────────────────────────────────────────────────────────────

import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as EmployeeModel from '../models/employeeModel.js';

// ─────────────────────────────────────────────────────────────
// GET /employees — List all employees with manager name
// ─────────────────────────────────────────────────────────────
export const getAll = asyncHandler(async (_req, res) => {
  const employees = await EmployeeModel.findAll();

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

// ─────────────────────────────────────────────────────────────
// POST /employees — Create a new employee
// ─────────────────────────────────────────────────────────────
export const create = asyncHandler(async (req, res) => {
  const { first_name, last_name, salary, joined_date, responsibility, contact_no } = req.body;

  // Validate required fields
  if (!first_name || !last_name || salary === undefined || !joined_date || !responsibility || !contact_no) {
    throw new ApiError(
      400,
      'first_name, last_name, salary, joined_date, responsibility, and contact_no are required'
    );
  }

  const result = await EmployeeModel.create(req.body);

  // Fetch the full record (with manager_name via JOIN) to return
  const employee = await EmployeeModel.findById(result.insertId);

  res.status(201).json({
    success: true,
    message: 'Employee created',
    data: employee,
  });
});

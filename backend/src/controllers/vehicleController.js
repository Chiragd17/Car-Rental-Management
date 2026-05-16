// ──────────────────────────────────────────────────────────────
// vehicleController.js — CRUD for the vehicle fleet
// ──────────────────────────────────────────────────────────────
// GET endpoints are PUBLIC (no auth needed — visitors browse).
// POST / PUT / DELETE are PROTECTED (admin/employee actions).
// ──────────────────────────────────────────────────────────────

import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as VehicleModel from '../models/vehicleModel.js';

// ─────────────────────────────────────────────────────────────
// GET /vehicles — List all vehicles
// Query params: ?available=true  → only available ones
// ─────────────────────────────────────────────────────────────
export const getAll = asyncHandler(async (req, res) => {
  // Parse the "available" query parameter if present
  let availableOnly;
  if (req.query.available !== undefined) {
    availableOnly = req.query.available === 'true';
  }
  const location = req.query.location || null;

  const vehicles = await VehicleModel.findAll(availableOnly, location);

  res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
});

// ─────────────────────────────────────────────────────────────
// GET /vehicles/:id — Get a single vehicle
// ─────────────────────────────────────────────────────────────
export const getOne = asyncHandler(async (req, res) => {
  const vehicle = await VehicleModel.findById(req.params.id);

  if (!vehicle) {
    throw new ApiError(404, `Vehicle with id ${req.params.id} not found`);
  }

  res.status(200).json({ success: true, data: vehicle });
});

// ─────────────────────────────────────────────────────────────
// POST /vehicles — Create a new vehicle (PROTECTED)
// ─────────────────────────────────────────────────────────────
export const create = asyncHandler(async (req, res) => {
  const { plate_no, model, daily_price, location } = req.body;

  // Validate required fields
  if (!plate_no || !model || daily_price === undefined || !location) {
    throw new ApiError(400, 'plate_no, model, daily_price, and location are required');
  }

  const result = await VehicleModel.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Vehicle created',
    data: { vehicle_id: result.insertId },
  });
});

// ─────────────────────────────────────────────────────────────
// PUT /vehicles/:id — Update a vehicle (PROTECTED)
// ─────────────────────────────────────────────────────────────
export const update = asyncHandler(async (req, res) => {
  // Check existence first
  const existing = await VehicleModel.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, `Vehicle with id ${req.params.id} not found`);
  }

  await VehicleModel.update(req.params.id, req.body);

  const updated = await VehicleModel.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Vehicle updated',
    data: updated,
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /vehicles/:id — Delete a vehicle (PROTECTED)
// ─────────────────────────────────────────────────────────────
export const remove = asyncHandler(async (req, res) => {
  const existing = await VehicleModel.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, `Vehicle with id ${req.params.id} not found`);
  }

  await VehicleModel.remove(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted',
  });
});

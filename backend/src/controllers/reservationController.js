// ──────────────────────────────────────────────────────────────
// reservationController.js — Reservation CRUD with transactions
// ──────────────────────────────────────────────────────────────
// Creating & cancelling a reservation are TRANSACTIONAL because
// they involve TWO tables (reservation + vehicle.availability).
// If one step fails, the other must roll back.
//
// Transaction workflow:
//   1. pool.getConnection()
//   2. connection.beginTransaction()
//   3. run queries on `connection`
//   4. connection.commit()     on success
//   5. connection.rollback()   on failure
//   6. connection.release()    ALWAYS (finally block)
// ──────────────────────────────────────────────────────────────

import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import db from '../config/db.js';
import * as ReservationModel from '../models/reservationModel.js';
import * as VehicleModel from '../models/vehicleModel.js';
import * as CustomerModel from '../models/customerModel.js';

// ─────────────────────────────────────────────────────────────
// POST /reservations — Create a reservation + mark vehicle unavailable
// ─────────────────────────────────────────────────────────────
export const create = asyncHandler(async (req, res) => {
  const { pickup_date, return_date, pickup_location, vehicle_id } = req.body;

  // ── Validate required fields ──────────────────────────────
  if (!pickup_date || !return_date || !pickup_location || !vehicle_id) {
    throw new ApiError(400, 'pickup_date, return_date, pickup_location, and vehicle_id are required');
  }

  // ── Resolve the customer's internal cust_id from JWT ──────
  const customer = await CustomerModel.findBySupabaseUid(req.user.sub);
  if (!customer) {
    throw new ApiError(404, 'Customer not found — call /auth/sync-user first');
  }

  // ── Check vehicle exists and is available ─────────────────
  const vehicle = await VehicleModel.findById(vehicle_id);
  if (!vehicle) {
    throw new ApiError(404, `Vehicle ${vehicle_id} not found`);
  }
  if (!vehicle.availability) {
    throw new ApiError(409, `Vehicle ${vehicle_id} is already reserved`);
  }

  // ── Begin transaction ─────────────────────────────────────
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert the reservation row
    const result = await ReservationModel.create(
      {
        reserve_date: new Date().toISOString().slice(0, 10), // today
        pickup_date,
        return_date,
        pickup_location,
        cust_id: customer.cust_id,
        vehicle_id,
      },
      connection
    );

    // 2. Mark the vehicle as unavailable
    await VehicleModel.setAvailability(vehicle_id, false, connection);

    await connection.commit(); // ✅ both succeeded

    res.status(201).json({
      success: true,
      message: 'Reservation created',
      data: { reserve_id: result.insertId },
    });
  } catch (err) {
    await connection.rollback(); // ❌ undo everything
    throw err; // re-throw so global error handler catches it
  } finally {
    connection.release(); // 🔓 return connection to pool
  }
});

// ─────────────────────────────────────────────────────────────
// GET /reservations/my — My reservations with estimated_total
// ─────────────────────────────────────────────────────────────
export const getMy = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findBySupabaseUid(req.user.sub);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const reservations = await ReservationModel.findByCustomerId(customer.cust_id);

  res.status(200).json({
    success: true,
    count: reservations.length,
    data: reservations,
  });
});

// ─────────────────────────────────────────────────────────────
// GET /reservations/:id — Get one reservation
// ─────────────────────────────────────────────────────────────
export const getOne = asyncHandler(async (req, res) => {
  const reservation = await ReservationModel.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, `Reservation ${req.params.id} not found`);
  }

  res.status(200).json({ success: true, data: reservation });
});

// ─────────────────────────────────────────────────────────────
// PUT /reservations/:id — Update dates / location
// ─────────────────────────────────────────────────────────────
export const update = asyncHandler(async (req, res) => {
  const existing = await ReservationModel.findById(req.params.id);
  if (!existing) {
    throw new ApiError(404, `Reservation ${req.params.id} not found`);
  }

  await ReservationModel.update(req.params.id, req.body);

  const updated = await ReservationModel.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Reservation updated',
    data: updated,
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /reservations/:id — Cancel reservation + restore vehicle
// ─────────────────────────────────────────────────────────────
export const cancel = asyncHandler(async (req, res) => {
  const reserveId = req.params.id;

  // ── Begin transaction ─────────────────────────────────────
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch the reservation (on the transactional connection)
    const reservation = await ReservationModel.findByIdRaw(reserveId, connection);
    if (!reservation) {
      throw new ApiError(404, `Reservation ${reserveId} not found`);
    }

    // 2. Soft-cancel: store cancellation reason
    const reason = req.body.cancellation_details || 'Cancelled by customer';
    await ReservationModel.cancel(reserveId, reason, connection);

    // 3. Restore vehicle availability
    await VehicleModel.setAvailability(reservation.vehicle_id, true, connection);

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled — vehicle is now available',
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

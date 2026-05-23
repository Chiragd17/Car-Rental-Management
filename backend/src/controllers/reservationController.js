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
import * as RentModel from '../models/rentModel.js';

// ─────────────────────────────────────────────────────────────
// Refund Policy — calculates refund percentage based on days
// until pickup date
// ─────────────────────────────────────────────────────────────
function calculateRefundPercentage(pickupDate) {
  const now = new Date();
  
  // Robust parsing: convert to ISO string and slice to get YYYY-MM-DD
  const dateStr = typeof pickupDate === 'string' 
    ? pickupDate 
    : new Date(pickupDate).toISOString();
  const yyyymmdd = dateStr.slice(0, 10);
  
  // Assuming standard pickup starts at 09:00 AM on the pickup date
  const pickup = new Date(`${yyyymmdd}T09:00:00`);
  
  const diffMs = pickup.getTime() - now.getTime();
  const hoursUntilPickup = diffMs / (1000 * 60 * 60);

  if (hoursUntilPickup > 48) return 100;    // > 48 hours → 100% refund
  if (hoursUntilPickup >= 24) return 75;    // 24–48 hours → 75% refund
  if (hoursUntilPickup >= 12) return 50;    // 12–24 hours → 50% refund
  return 0;                                 // < 12 hours or after pickup starts → 0% refund
}

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
    throw new ApiError(409, `Vehicle ${vehicle_id} is currently marked as unavailable`);
  }

  // ── Strict Date-Overlap Checking ──────────────────────────
  const isOverlapping = await ReservationModel.checkOverlap(vehicle_id, pickup_date, return_date);
  if (isOverlapping) {
    throw new ApiError(409, 'This vehicle is already booked for the selected dates. Please choose different dates.');
  }

  // ── Calculate Tax ─────────────────────────────────────────
  const start = new Date(pickup_date);
  const end = new Date(return_date);
  const numberOfDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
  const base_rent = numberOfDays * vehicle.daily_price;

  const type = (vehicle.vehicle_type || '').toLowerCase();
  const model = (vehicle.model || '').toLowerCase();
  let tax_percentage = 12;
  if (['hatchback', 'sedan', 'compact suv'].includes(type)) tax_percentage = 5;
  if (['suv', 'muv', 'ev'].includes(type)) tax_percentage = 12;
  if (type.includes('luxury') || ['bmw', 'mercedes', 'audi', 'jaguar'].some(m => model.includes(m))) tax_percentage = 18;

  const tax_amount = (base_rent * tax_percentage) / 100;

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
        tax_percentage,
        tax_amount,
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

  const updateData = { ...req.body };
  if (updateData.pickup_date || updateData.return_date) {
    const pickup = updateData.pickup_date || existing.pickup_date;
    const returnD = updateData.return_date || existing.return_date;
    const start = new Date(pickup);
    const end = new Date(returnD);
    const numberOfDays = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
    const vehicle = await VehicleModel.findById(existing.vehicle_id);
    const base_rent = numberOfDays * vehicle.daily_price;
    updateData.tax_amount = (base_rent * existing.tax_percentage) / 100;
  }

  await ReservationModel.update(req.params.id, updateData);

  const updated = await ReservationModel.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Reservation updated',
    data: updated,
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /reservations/:id — Cancel reservation + calculate
// refund + restore vehicle availability
// ─────────────────────────────────────────────────────────────
export const cancel = asyncHandler(async (req, res) => {
  const reserveId = req.params.id;
  const {
    cancellation_reason = 'Not specified',
    cancellation_details = 'Cancelled by customer',
  } = req.body;

  // ── Begin transaction ─────────────────────────────────────
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch the reservation (with estimated_total via JOIN)
    const reservation = await ReservationModel.findById(reserveId);
    if (!reservation) {
      throw new ApiError(404, `Reservation ${reserveId} not found`);
    }

    // 2. Check it's not already cancelled
    if (reservation.cancellation_details) {
      throw new ApiError(400, 'This reservation is already cancelled');
    }

    // 3. Calculate refund based on policy
    const refundPercentage = calculateRefundPercentage(reservation.pickup_date);
    const estimatedTotal = Number(reservation.estimated_total) || 0;
    const calculatedRefund = Math.round((estimatedTotal * refundPercentage) / 100);

    // 4. Check if a rent (payment) record exists for this reservation
    let damageCompensation = 0;
    let finalRefund = calculatedRefund;
    const rentRecord = await RentModel.findByReserveId(reserveId, connection);

    if (rentRecord) {
      // Read any damage compensation from the rent record
      damageCompensation = Number(rentRecord.damage_compensation) || 0;

      // Deduct damage compensation from refund
      finalRefund = Math.max(0, calculatedRefund - damageCompensation);

      // Update the refund field on the rent record
      await RentModel.updateRefund(rentRecord.rent_id, finalRefund, connection);
    }

    // 5. Build the cancellation details string
    const fullDetails = `${cancellation_reason}: ${cancellation_details}`;

    // 6. Soft-cancel: store reason, details, and refund info
    await ReservationModel.cancel(reserveId, {
      cancellation_details: fullDetails,
      cancellation_reason,
      refund_amount: finalRefund,
      refund_percentage: refundPercentage,
    }, connection);

    // 7. Restore vehicle availability
    await VehicleModel.setAvailability(reservation.vehicle_id, true, connection);

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled',
      refund_percentage: refundPercentage,
      calculated_refund: calculatedRefund,
      damage_compensation: damageCompensation,
      final_refund: finalRefund,
      cancellation_reason,
      cancellation_details: fullDetails,
      estimated_total: estimatedTotal,
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /reservations/:id/complete — Mark as returned/completed
// ─────────────────────────────────────────────────────────────
export const markCompleted = asyncHandler(async (req, res) => {
  const reserveId = req.params.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const reservation = await ReservationModel.findById(reserveId);
    if (!reservation) {
      throw new ApiError(404, `Reservation ${reserveId} not found`);
    }

    if (reservation.completed_at) {
      throw new ApiError(400, 'This reservation is already marked as completed');
    }

    if (reservation.cancellation_details) {
      throw new ApiError(400, 'Cannot complete a cancelled reservation');
    }

    // 1. Mark reservation as completed
    await ReservationModel.markCompleted(reserveId, connection);

    // 2. Restore vehicle availability
    await VehicleModel.setAvailability(reservation.vehicle_id, true, connection);

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Reservation marked as completed and vehicle is now available',
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

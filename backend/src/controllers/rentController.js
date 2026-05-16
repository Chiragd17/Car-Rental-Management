// ──────────────────────────────────────────────────────────────
// rentController.js — Payment / rent record management
// ──────────────────────────────────────────────────────────────
// total_pay is a DERIVED attribute — calculated here, not stored
// as a generated column.
//
// Formula: (number_of_days × daily_price) + damage_compensation - refund
// ──────────────────────────────────────────────────────────────

import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as RentModel from '../models/rentModel.js';
import * as ReservationModel from '../models/reservationModel.js';
import * as VehicleModel from '../models/vehicleModel.js';
import * as CustomerModel from '../models/customerModel.js';

// ─────────────────────────────────────────────────────────────
// POST /rents — Record a payment (auto-calculate total_pay)
// ─────────────────────────────────────────────────────────────
export const create = asyncHandler(async (req, res) => {
  const {
    pay_method,
    down_payment = 0,
    refund = 0,
    damage_compensation = 0,
    pay_date,
    reserve_id,
  } = req.body;

  // ── Validate required fields ──────────────────────────────
  if (!pay_method || !pay_date || !reserve_id) {
    throw new ApiError(400, 'pay_method, pay_date, and reserve_id are required');
  }

  // ── Fetch the reservation to get number_of_days & vehicle ─
  const reservation = await ReservationModel.findById(reserve_id);
  if (!reservation) {
    throw new ApiError(404, `Reservation ${reserve_id} not found`);
  }

  // ── Fetch the vehicle to get daily_price ──────────────────
  const vehicle = await VehicleModel.findById(reservation.vehicle_id);
  if (!vehicle) {
    throw new ApiError(404, 'Associated vehicle not found');
  }

  // ── Resolve customer ──────────────────────────────────────
  const customer = await CustomerModel.findBySupabaseUid(req.user.sub);
  if (!customer) {
    throw new ApiError(404, 'Customer not found — call /auth/sync-user first');
  }

  // ── Calculate total_pay (DERIVED — not stored in schema) ──
  // Formula: (number_of_days × daily_price) + damage_compensation - refund
  const numberOfDays = reservation.number_of_days || 0;
  const dailyPrice   = Number(vehicle.daily_price);
  const totalPay     = (numberOfDays * dailyPrice)
                       + Number(damage_compensation)
                       - Number(refund);

  // ── Insert the rent record ────────────────────────────────
  const result = await RentModel.create({
    pay_method,
    down_payment,
    refund,
    damage_compensation,
    total_pay: totalPay,
    pay_date,
    cust_id:    customer.cust_id,
    vehicle_id: reservation.vehicle_id,
    reserve_id,
  });

  res.status(201).json({
    success: true,
    message: 'Rent record created',
    data: {
      rent_id:   result.insertId,
      total_pay: totalPay,
    },
  });
});

// ─────────────────────────────────────────────────────────────
// GET /rents/my — My rent records
// ─────────────────────────────────────────────────────────────
export const getMy = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findBySupabaseUid(req.user.sub);
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const rents = await RentModel.findByCustomerId(customer.cust_id);

  res.status(200).json({
    success: true,
    count: rents.length,
    data: rents,
  });
});

// ─────────────────────────────────────────────────────────────
// GET /rents/:id — Get one rent record
// ─────────────────────────────────────────────────────────────
export const getOne = asyncHandler(async (req, res) => {
  const rent = await RentModel.findById(req.params.id);

  if (!rent) {
    throw new ApiError(404, `Rent record ${req.params.id} not found`);
  }

  res.status(200).json({ success: true, data: rent });
});

// ─────────────────────────────────────────────────────────────
// PUT /rents/by-reservation/:reserve_id/damage — Add damage
// ─────────────────────────────────────────────────────────────
export const addDamageCompensation = asyncHandler(async (req, res) => {
  const { reserve_id } = req.params;
  const { damage_amount, damage_description } = req.body;

  if (damage_amount === undefined || damage_amount < 0) {
    throw new ApiError(400, 'Valid damage_amount is required and cannot be negative');
  }

  // Fetch the rent record
  const rent = await RentModel.findByReserveId(reserve_id);
  if (!rent) {
    throw new ApiError(404, `No payment/rent record found for reservation ${reserve_id}`);
  }

  // Fetch reservation and vehicle to validate rules and recalculate
  const reservation = await ReservationModel.findById(reserve_id);
  if (!reservation) {
    throw new ApiError(404, `Reservation ${reserve_id} not found`);
  }

  // VALIDATION: Cancelled bookings cannot have damage compensation added
  if (reservation.cancellation_details) {
    throw new ApiError(400, 'Cannot add damage compensation to a cancelled reservation');
  }

  // VALIDATION: Damage can only be added after the vehicle is returned
  const today = new Date();
  const returnDate = new Date(reservation.return_date);
  if (returnDate > today) {
    throw new ApiError(400, 'Cannot add damage compensation before the vehicle is returned (status must be Completed)');
  }

  const vehicle = await VehicleModel.findById(reservation.vehicle_id);
  if (!vehicle) {
    throw new ApiError(404, 'Associated vehicle not found');
  }

  // RECALCULATE PAYMENT SAFELY
  const numberOfDays = reservation.number_of_days || 0;
  const dailyPrice = Number(vehicle.daily_price);
  const baseRent = numberOfDays * dailyPrice;

  // Formula: base_rent + damage_compensation - refund
  let totalPay = baseRent + Number(damage_amount) - Number(rent.refund);

  // Clamp negative totals
  totalPay = Math.max(totalPay, 0);

  // Update DB
  await RentModel.updateDamage(reserve_id, damage_amount, damage_description || null, totalPay);

  res.status(200).json({
    success: true,
    reserve_id,
    damage_compensation: damage_amount,
    refund: rent.refund,
    total_pay: totalPay,
    damage_description: damage_description || null
  });
});

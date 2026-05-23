// ──────────────────────────────────────────────────────────────
// dashboardController.js — Aggregated stats for the admin panel
// ──────────────────────────────────────────────────────────────
// All stats are computed on-the-fly via model helpers (no
// materialised views or caching — fine for a student project).
// ──────────────────────────────────────────────────────────────

import asyncHandler from '../utils/asyncHandler.js';
import * as VehicleModel from '../models/vehicleModel.js';
import * as CustomerModel from '../models/customerModel.js';
import * as ReservationModel from '../models/reservationModel.js';
import * as RentModel from '../models/rentModel.js';

// ─────────────────────────────────────────────────────────────
// GET /dashboard/stats
// Returns:
//   totalVehicles, availableVehicles, totalCustomers,
//   totalReservations, cancelledReservations, totalRevenue,
//   topRentedVehicles (top 5)
// ─────────────────────────────────────────────────────────────
export const getStats = asyncHandler(async (_req, res) => {
  // Fire all independent queries in parallel for speed
  const [
    totalVehicles,
    availableVehicles,
    totalCustomers,
    totalReservations,
    cancelledReservations,
    revenueAnalytics,
    topRentedVehicles,
    activeReservations,
    completedRentals,
    recentBookings,
    reservationsPerDay,
    revenuePerDay,
    bookingsByVehicleType
  ] = await Promise.all([
    VehicleModel.countAll(),
    VehicleModel.countAvailable(),
    CustomerModel.countAll(),
    ReservationModel.countAll(),
    ReservationModel.countCancelled(),
    RentModel.revenueAnalytics(),
    RentModel.topRentedVehicles(),
    ReservationModel.countActive(),
    RentModel.countCompleted(),
    ReservationModel.getRecent(10),
    ReservationModel.getReservationsPerDay(),
    RentModel.getRevenuePerDay(),
    ReservationModel.getBookingsByVehicleType()
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalVehicles,
      availableVehicles,
      totalCustomers,
      totalReservations,
      cancelledReservations,
      revenueAnalytics,
      topRentedVehicles,
      activeReservations,
      completedRentals,
      recentBookings,
      reservationsPerDay,
      revenuePerDay,
      bookingsByVehicleType
    },
  });
});

// ──────────────────────────────────────────────────────────────
// authController.js — Sync Supabase user → MySQL & get profile
// ──────────────────────────────────────────────────────────────
// The frontend handles signup/login with Supabase Auth.
// After the user logs in and receives a JWT, the frontend
// calls POST /auth/sync-user to ensure a MySQL customer row
// exists for that Supabase UUID.
// ──────────────────────────────────────────────────────────────

import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as CustomerModel from '../models/customerModel.js';

// ─────────────────────────────────────────────────────────────
// POST /auth/sync-user
// Creates a MySQL customer row on first login (upsert).
// The JWT has already been verified by authMiddleware,
// so req.user contains the decoded payload.
// ─────────────────────────────────────────────────────────────
export const syncUser = asyncHandler(async (req, res) => {
  // req.user.sub   → Supabase UUID (always present in Supabase JWT)
  // req.user.email → user's email  (always present in Supabase JWT)
  const supabaseUid = req.user.sub;
  const email       = req.user.email || '';

  // The frontend MAY send first_name / last_name in the body;
  // otherwise we fall back to a sensible default derived from the email.
  const firstName = req.body.first_name || email.split('@')[0] || 'User';
  const lastName  = req.body.last_name  || '';

  // Upsert: INSERT … ON DUPLICATE KEY UPDATE
  await CustomerModel.upsert({
  supabaseUid,
  firstName,
  lastName,
  email,
contactNo: null
});
  // Fetch the (possibly just-created) full customer row to return
  const customer = await CustomerModel.findBySupabaseUid(supabaseUid);

  res.status(201).json({
    success: true,
    message: 'User synced successfully',
    data: customer,
  });
});

// ─────────────────────────────────────────────────────────────
// GET /auth/profile
// Returns the logged-in user's MySQL customer record.
// ─────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findBySupabaseUid(req.user.sub);

  if (!customer) {
    throw new ApiError(404, 'Customer profile not found — call /auth/sync-user first');
  }

  res.status(200).json({
    success: true,
    data: customer,
  });
});

// ──────────────────────────────────────────────────────────────
// customerController.js — "Me" profile endpoints
// ──────────────────────────────────────────────────────────────
// Customers can only read/update their OWN profile.
// The Supabase UUID from the JWT identifies them.
// ──────────────────────────────────────────────────────────────

import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as CustomerModel from '../models/customerModel.js';

// ─────────────────────────────────────────────────────────────
// GET /customers/me — Get my profile
// ─────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findBySupabaseUid(req.user.sub);

  if (!customer) {
    throw new ApiError(404, 'Profile not found — please sync your account first');
  }

  res.status(200).json({ success: true, data: customer });
});

// ─────────────────────────────────────────────────────────────
// PUT /customers/me — Update my profile
// ─────────────────────────────────────────────────────────────
export const updateMe = asyncHandler(async (req, res) => {
  const supabaseUid = req.user.sub;

  // Ensure the customer exists before trying to update
  const existing = await CustomerModel.findBySupabaseUid(supabaseUid);
  if (!existing) {
    throw new ApiError(404, 'Profile not found — please sync your account first');
  }

  // Pass only the fields the client sent (undefined = keep current value)
  await CustomerModel.updateProfile(supabaseUid, req.body);

  // Return the freshly updated row
  const updated = await CustomerModel.findBySupabaseUid(supabaseUid);

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: updated,
  });
});

// ─────────────────────────────────────────────────────────────
// GET /customers/:id/history — Get customer history (admin)
// ─────────────────────────────────────────────────────────────
export const getHistory = asyncHandler(async (req, res) => {
  const custId = req.params.id;
  const history = await CustomerModel.getHistory(custId);

  res.status(200).json({
    success: true,
    data: history,
  });
});

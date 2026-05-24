// ──────────────────────────────────────────────────────────────
// errorMiddleware.js — Global Error Handler
// ──────────────────────────────────────────────────────────────
// Express recognises a function with FOUR parameters as an
// error-handling middleware.  Whenever `next(err)` or an
// uncaught throw reaches Express, this function runs.
//
// It handles:
//   • Our own ApiError instances (known, intentional errors)
//   • MySQL duplicate-entry errors  → 409 Conflict
//   • MySQL FK-reference errors     → 409 Conflict
//   • Everything else               → 500 Internal Server Error
// ──────────────────────────────────────────────────────────────

import ApiError from '../utils/ApiError.js';

// eslint-disable-next-line no-unused-vars  ← Express requires 4 params
const errorHandler = (err, _req, res, _next) => {
  // ── 1. Log full error in development for debugging ────────
  if (process.env.NODE_ENV !== 'production') {
    if (err instanceof ApiError) {
      console.warn(`⚠️  Api Validation [${err.statusCode}] → ${err.message}`);
    } else if (err.statusCode === 401) {
      console.warn(`⚠️  Auth Warning → ${err.message}`);
    } else {
      console.error('❌  Unhandled Server Error →', err);
    }
  }

  // ── 2. If it's our custom ApiError, use its statusCode ────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // ── 3. Handle known MySQL error codes ─────────────────────
  //    ER_DUP_ENTRY          → duplicate unique key (e.g. same plate_no)
  //    ER_ROW_IS_REFERENCED_2 → cannot delete row referenced by FK
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: `Duplicate entry — ${err.sqlMessage || 'a unique field already exists'}`,
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Cannot delete — this record is referenced by other data',
    });
  }

  // ── 4. Fallback: unknown / unexpected error ───────────────
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
};

export default errorHandler;

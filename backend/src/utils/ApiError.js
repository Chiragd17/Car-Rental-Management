// ──────────────────────────────────────────────────────────────
// ApiError.js — Custom error class with HTTP status code
// ──────────────────────────────────────────────────────────────
// Throwing `new ApiError(404, 'Vehicle not found')` anywhere in
// the codebase lets the global error handler respond with the
// correct HTTP status and a clean JSON body.
//
// Why extend Error?
//   → So that `instanceof ApiError` works, and we can distinguish
//     our intentional errors from unexpected runtime crashes.
// ──────────────────────────────────────────────────────────────

class ApiError extends Error {
  /**
   * @param {number} statusCode  — HTTP status (e.g. 400, 404, 409)
   * @param {string} message     — human-readable error description
   */
  constructor(statusCode, message) {
    super(message);              // sets this.message
    this.statusCode = statusCode; // custom property read by error handler
    this.name = 'ApiError';       // helps with logging / debugging
  }
}

export default ApiError;

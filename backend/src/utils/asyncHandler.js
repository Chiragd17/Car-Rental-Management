// ──────────────────────────────────────────────────────────────
// asyncHandler.js — Wraps async route handlers
// ──────────────────────────────────────────────────────────────
// Express does NOT catch errors thrown inside async functions
// automatically (at least not in v4).  Without this wrapper,
// every controller would need its own try/catch + next(err).
//
// Usage:
//   router.get('/cars', asyncHandler(async (req, res) => { … }));
//
// How it works:
//   1. We return a NEW function that Express calls with (req, res, next).
//   2. Inside, we call your async function and `.catch(next)` on its
//      returned promise so that any rejected promise is forwarded
//      to the global error middleware.
// ──────────────────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

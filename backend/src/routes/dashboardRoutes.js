// ──────────────────────────────────────────────────────────────
// dashboardRoutes.js — /dashboard endpoints (PROTECTED)
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getStats } from '../controllers/dashboardController.js';

const router = Router();

// Dashboard requires authentication (admin view)
router.use(protect);

// GET /dashboard/stats → aggregated system statistics
router.get('/stats', getStats);

export default router;

// ──────────────────────────────────────────────────────────────
// rentRoutes.js — /rents endpoints (all PROTECTED)
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { create, getMy, getOne, addDamageCompensation } from '../controllers/rentController.js';

const router = Router();

// All rent endpoints require authentication
router.use(protect);

// POST  /rents      → record a payment
router.post('/', create);

// GET   /rents/my   → my rent records
router.get('/my', getMy);

// GET   /rents/:id  → single rent record
router.get('/:id', getOne);

// PUT   /rents/by-reservation/:reserve_id/damage → admin adds damage compensation
router.put('/by-reservation/:reserve_id/damage', addDamageCompensation);

export default router;

// ──────────────────────────────────────────────────────────────
// reservationRoutes.js — /reservations endpoints (all PROTECTED)
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  create,
  getMy,
  getOne,
  update,
  cancel,
  markCompleted,
} from '../controllers/reservationController.js';

const router = Router();

// Every reservation endpoint requires a valid Supabase JWT
router.use(protect);

// POST   /reservations       → create + mark vehicle unavailable
router.post('/',   create);

// GET    /reservations/my    → my reservations with estimated_total
router.get('/my',  getMy);

// GET    /reservations/:id   → single reservation
router.get('/:id', getOne);

// PUT    /reservations/:id   → update dates / location
router.put('/:id', update);

// DELETE /reservations/:id   → cancel + restore vehicle availability
router.delete('/:id', cancel);

// PUT    /reservations/:id/complete → mark returned + restore vehicle availability
router.put('/:id/complete', markCompleted);

export default router;

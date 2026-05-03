// ──────────────────────────────────────────────────────────────
// vehicleRoutes.js — /vehicles endpoints
// ──────────────────────────────────────────────────────────────
// GET routes are PUBLIC (no auth) — visitors can browse the fleet.
// POST / PUT / DELETE are PROTECTED — only authenticated users
// (typically admins/employees) can modify the fleet.
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getAll,
  getOne,
  create,
  update,
  remove,
} from '../controllers/vehicleController.js';

const router = Router();

// ── Public routes ───────────────────────────────────────────
router.get('/',    getAll);
router.get('/:id', getOne);

// ── Protected routes ────────────────────────────────────────
router.post('/',      protect, create);
router.put('/:id',    protect, update);
router.delete('/:id', protect, remove);

export default router;

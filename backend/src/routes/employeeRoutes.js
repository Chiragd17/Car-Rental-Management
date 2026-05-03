// ──────────────────────────────────────────────────────────────
// employeeRoutes.js — /employees endpoints (all PROTECTED)
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getAll, create } from '../controllers/employeeController.js';

const router = Router();

// All employee endpoints require authentication
router.use(protect);

// GET  /employees  → list with manager name
router.get('/', getAll);

// POST /employees  → create new employee
router.post('/', create);

export default router;

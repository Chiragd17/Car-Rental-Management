// ──────────────────────────────────────────────────────────────
// customerRoutes.js — /customers endpoints
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getMe, updateMe } from '../controllers/customerController.js';

const router = Router();

// All customer profile routes require authentication
router.use(protect);

// GET  /customers/me  → get my profile
router.get('/me', getMe);

// PUT  /customers/me  → update my profile
router.put('/me', updateMe);

export default router;

// ──────────────────────────────────────────────────────────────
// authRoutes.js — /auth endpoints
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { syncUser, getProfile } from '../controllers/authController.js';

const router = Router();

// POST /auth/sync-user  → create/update MySQL customer from JWT
router.post('/sync-user', protect, syncUser);

// GET  /auth/profile     → return logged-in user's MySQL record
router.get('/profile', protect, getProfile);

export default router;

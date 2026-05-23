// ──────────────────────────────────────────────────────────────
// authMiddleware.js — Supabase JWT Verification
// ──────────────────────────────────────────────────────────────
// This middleware sits in front of every PROTECTED route:
//
//   1. Reads the "Authorization: Bearer <token>" header.
//   2. Verifies the JWT using the SUPABASE_JWT_SECRET (HS256).
//   3. Attaches the decoded payload to `req.user`.
//      → req.user.sub  === the Supabase UUID of the logged-in user
//      → req.user.email, req.user.role, etc. are also available
//
// If verification fails, we short-circuit with 401 Unauthorized.
// ──────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import ApiError from '../utils/ApiError.js';

const client = jwksClient({
  jwksUri: 'https://qekiscglomsmpbjkrzng.supabase.co/auth/v1/.well-known/jwks.json'
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
};

const protect = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, { algorithms: ['ES256'] }, (err, decoded) => {
    if (err) {
      console.log('JWT ERROR:', err.message);
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    req.user = decoded;
    next();
  });
};

export default protect;

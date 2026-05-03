// ──────────────────────────────────────────────────────────────
// supabase.js — Supabase Client (read-only, for optional use)
// ──────────────────────────────────────────────────────────────
// We initialise the Supabase JS client here.  In this project
// we do NOT use Supabase as our primary database (MySQL handles
// that).  The client is available in case you ever need to call
// Supabase APIs (storage, edge functions, etc.) from the server.
//
// JWT verification is done directly with jsonwebtoken in the
// auth middleware — it does NOT depend on this client.
// ──────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Both values come from your Supabase project dashboard
const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseAnon = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '⚠️  SUPABASE_URL or SUPABASE_ANON_KEY is missing from .env — ' +
    'Supabase client will not work.'
  );
}

const supabase = createClient(supabaseUrl || '', supabaseAnon || '');

export default supabase;

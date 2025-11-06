import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffprobe from 'ffprobe-static';
import ffmpegBin from 'ffmpeg-static';
import slugify from 'slugify';
import { z } from 'zod';

ffmpeg.setFfprobePath(ffprobe.path);
if (ffmpegBin) {
  ffmpeg.setFfmpegPath(ffmpegBin);
}

function getJwtRole(token) {
  try {
    const parts = (token || '').split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return payload?.role || 'unknown';
    }
  } catch {}
  return 'unknown';
}

// -------- App setup --------
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Use specific APP_BASE_URL if provided; otherwise reflect request origin (true)
// CORS for frontend dev origin
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

// -------- Supabase client (server-side, pakai service_role) --------
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
if (!process.env.SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE/SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const resolvedRole = getJwtRole(SUPABASE_SERVICE_ROLE);
console.log('JWT role from SUPABASE key:', resolvedRole);
if (resolvedRole !== 'service_role') {
  console.error('[ERROR] You are NOT using a service_role key. Fix your .env: set SUPABASE_SERVICE_ROLE to the service_role secret key.');
  process.exit(1);
}

// -------- Email transporter --------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }, // App Password Gmail
});

// -------- Constants & utils --------
const BUCKET_MEDIA = process.env.BUCKET_MEDIA || 'dev-stockwise-bucket';
console.log('Using bucket:', BUCKET_MEDIA);

const TMP_UPLOAD_DIR = path.join(os.tmpdir(), 'stockwise-video-upload');
if (!fs.existsSync(TMP_UPLOAD_DIR)) {
  fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, TMP_UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.mp4';
      const name = `${Date.now()}-${uuidv4()}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
});

const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const fail = (res, message = 'Unexpected error', status = 500, extra = {}) =>
  res.status(status).json({ ok: false, message, ...extra });

const parseBool = (v, def = false) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return ['true', '1', 'yes', 'y'].includes(v.toLowerCase());
  return def;
};

// Public helpers
function parsePagination({ page, limit }) {
  const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '12', 10) || 12));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;
  return { page: pageNum, limit: limitNum, from, to };
}

function parseSort(sortParam) {
  const allowed = new Set(['updated_at', 'created_at', 'price', 'title', 'id']);
  let col = 'updated_at';
  let dir = 'desc';
  if (typeof sortParam === 'string' && sortParam) {
    const [c, d] = String(sortParam).split('.');
    if (allowed.has(c)) {
      col = c;
      dir = (d || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    }
  }
  return { col, dir };
}

function toNumberSafe(x) {
  const n = Number(String(x ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const bucketPublicCache = { value: null, checked: false };

// -------- Referral envs --------
const REFERRAL_COMMISSION_PCT = (() => {
  const v = Number(process.env.REFERRAL_COMMISSION_PCT ?? 0.2);
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.2;
})();
const REFERRAL_MIN_WITHDRAW = (() => {
  const v = parseInt(process.env.REFERRAL_MIN_WITHDRAW ?? '100000', 10);
  return Number.isFinite(v) && v >= 0 ? v : 100000;
})();
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_BASE_URL || 'http://localhost:5173';
const REFERRAL_ALLOWED_PAYMENT_METHODS = (process.env.REFERRAL_ALLOWED_PAYMENT_METHODS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function isBucketPublic() {
  if (bucketPublicCache.checked) {
    return bucketPublicCache.value ?? true;
  }
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_MEDIA);
    if (error) {
      console.warn('getBucket failed, assuming public bucket', error.message);
      bucketPublicCache.checked = true;
      bucketPublicCache.value = true;
      return true;
    }
    bucketPublicCache.checked = true;
    bucketPublicCache.value = data?.public ?? true;
    return bucketPublicCache.value;
  } catch (err) {
    console.warn('getBucket threw, assuming public bucket', err?.message || err);
    bucketPublicCache.checked = true;
    bucketPublicCache.value = true;
    return true;
  }
}

function slugifyFilename(filename) {
  if (!filename) return 'file';
  const base = slugify(filename.replace(/\.[^/.]+$/, ''), { lower: true, strict: true });
  return base || 'file';
}

async function probeDurationSec(filePath) {
  return new Promise((resolve) => {
    try {
      ffmpeg.ffprobe(filePath, (err, meta) => {
        if (err) {
          console.warn('ffprobe error (skip duration):', err?.message || err);
          return resolve(0);
        }
        const sec = Math.round(meta?.format?.duration || 0);
        resolve(Number.isFinite(sec) ? sec : 0);
      });
    } catch (e) {
      console.warn('ffprobe exception (skip duration):', e?.message || e);
      resolve(0);
    }
  });
}

async function ensureBucket(name) {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;
  const exists = buckets?.some((bucket) => bucket.name === name);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
      allowedMimeTypes: ['image/*', 'video/*'],
    });
    if (createErr && createErr.statusCode !== '409') throw createErr;
  }
}

if (resolvedRole === 'service_role') {
  ensureBucket(BUCKET_MEDIA)
    .then(() => console.log('Storage bucket checked'))
    .catch((e) => console.error('ensureBucket failed:', e.message || e));
} else {
  console.warn('Skipping ensureBucket because key is not service_role.');
}

async function getFileUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
  // For private buckets use signed URL:
  // const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  // return signed.data.signedUrl;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
// moved to earlier env block; see "// -------- Referral envs --------"

function signToken(user) {
  const payload = {
    sub: user.id,
    id: user.id,
    role: user.role,
    username: user.username,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// ===== Referral helpers =====
function genReferralCode(len = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

async function ensureReferralCode(userId) {
  const { data: u } = await supabase.from('users').select('referral_code').eq('id', userId).single();
  if (u?.referral_code) return u.referral_code;
  for (let i = 0; i < 5; i += 1) {
    const code = genReferralCode();
    const { error } = await supabase.from('users').update({ referral_code: code }).eq('id', userId);
    if (!error) return code;
    if (String(error?.message || '').toLowerCase().includes('duplicate')) continue;
  }
  const fallback = genReferralCode(10);
  await supabase.from('users').update({ referral_code: fallback }).eq('id', userId);
  return fallback;
}

async function referralBalance(userId) {
  const { data, error } = await supabase
    .from('referral_commissions')
    .select('amount,status')
    .eq('referrer_id', userId);
  if (error) throw error;
  let approvedPending = 0;
  let paid = 0;
  (data || []).forEach((r) => {
    const amt = Number(r.amount || 0);
    const st = String(r.status || '').toLowerCase();
    if (st === 'paid') paid += amt;
    else if (st === 'approved' || st === 'pending') approvedPending += amt;
  });
  const totalApproved = approvedPending + paid;
  return { totalApproved, totalPaid: paid, balance: totalApproved - paid };
}

// ---- Course tier/role mapping helpers ----
// DB stores membership gating in courses.min_tier: 'FREE' | 'PREMIUM' | 'VIP'
// Some legacy admin/UI paths still use min_role: 'free'|'beginer'|'intermediate'|'advanced'|'admin'
function tierToRole(minTier) {
  const t = String(minTier || '').toUpperCase();
  if (t === 'VIP') return 'advanced';
  if (t === 'PREMIUM') return 'intermediate';
  return 'free';
}
function roleToTierCompat(minRole) {
  const r = String(minRole || '').toLowerCase();
  if (r === 'advanced' || r === 'admin') return 'VIP';
  if (r === 'intermediate' || r === 'beginer' || r === 'member' || r === 'premium') return 'PREMIUM';
  return 'FREE';
}

// Read token from Authorization: Bearer <token> or cookie "token"
function extractToken(req) {
  const auth = req.header('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  if (req.cookies && req.cookies.token) return String(req.cookies.token);
  return null;
}

// Verify JWT and load user from Supabase, attach as req.user
async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.sub) return res.status(401).json({ error: 'Unauthorized' });

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, name, role, is_verified, created_at, updated_at')
      .eq('id', payload.sub)
      .single();
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

    req.user = user;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Active batch helper
async function getActiveBatch() {
  const now = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .or(`and(is_active.eq.true),and(start_date.lte.${now},end_date.gte.${now})`)
    .order('start_date', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

// Generic auth middleware (non-admin)
function requireAuth(req, res, next) {
  try {
    const auth = req.header('Authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = auth.slice(7).trim();
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload) return res.status(401).json({ message: 'Unauthorized' });
    // normalize id
    req.user = {
      id: payload.id || payload.sub,
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
      username: payload.username,
      name: payload.name,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

async function adminAuth(req, res, next) {
  let token = req.header('X-Admin-Token');
  if (!token) {
    const authHeader = req.header('Authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, name, role, is_verified, created_at, updated_at')
      .eq('id', payload.sub)
      .single();

    if (error || !user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    console.log('[ADMIN API]', req.method, req.path, req.query);
    return next();
  } catch (err) {
    console.error('adminAuth failed', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

const requireAdmin = adminAuth;

// POST /api/auth/login
// Body: { identifier, password }
// Authenticates by username or email and returns { token, user }
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, name, role, is_verified, created_at, password')
      .or(`username.eq.${identifier},email.eq.${identifier}`)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password || '');
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ code: 'UNVERIFIED', message: 'Please verify your email.' });
    }

    const token = signToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at,
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login failed', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me
// Returns current authenticated user. Accepts token via header or cookie.
app.get('/api/auth/me', authenticate, (req, res) => res.json({ user: req.user }));

// GET /api/me - Profile + active membership summary
// Returns: { user: { ...user, membership_tier }, active_membership }
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    let data;
    // Attempt to select with avatar_url; if column missing, fallback without it
    try {
      const resp = await supabase
        .from('users')
        .select('id, username, email, name, role, is_verified, discord_id, phone, address, job, batch, membership_expires_at, referred_by, referral_code, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();
      if (resp.error) throw resp.error;
      data = resp.data;
    } catch (selErr) {
      const code = selErr && selErr.code;
      const msg = (selErr && selErr.message) || '';
      if (code === '42703' || /avatar_url/.test(msg)) {
        const resp2 = await supabase
          .from('users')
          .select('id, username, email, name, role, is_verified, discord_id, phone, address, job, batch, membership_expires_at, referred_by, referral_code, created_at, updated_at')
          .eq('id', userId)
          .single();
        if (resp2.error) throw resp2.error;
        data = resp2.data;
      } else {
        throw selErr;
      }
    }
    if (!data) return res.status(404).json({ message: 'Not found' });

    const now = new Date().toISOString();
    const { data: um, error: umErr } = await supabase
      .from('user_memberships')
      .select('*, membership_plans(*), batches(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .lte('started_at', now)
      .gte('expires_at', now)
      .order('expires_at', { ascending: false })
      .maybeSingle();
    if (umErr && umErr.code && umErr.code !== 'PGRST116') {
      console.warn('user_memberships fetch error:', umErr.message || umErr);
    }

    const membership_tier = um?.membership_plans?.role_granted || 'free';
    return res.json({ user: { ...data, membership_tier }, active_membership: um || null });
  } catch (e) {
    console.error('GET /api/me failed', e);
    return res.status(500).json({ message: e?.message || 'Failed' });
  }
});

// ===== Referral API =====
// GET /api/referral/stats
app.get('/api/referral/stats', requireAuth, async (req, res) => {
  try {
    const { totalApproved, totalPaid, balance } = await referralBalance(req.user.id);
    return res.json({
      balance,
      totalApproved,
      totalPaid,
      withdrawable: balance >= REFERRAL_MIN_WITHDRAW,
      minWithdraw: REFERRAL_MIN_WITHDRAW,
    });
  } catch (e) {
    console.error('[referral/stats]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET /api/referral/links
// Returns: { code, registration_link }. Ensures user has a referral_code and builds a frontend sign-up link.
app.get('/api/referral/links', requireAuth, async (req, res) => {
  try {
    const code = await ensureReferralCode(req.user.id);
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_BASE_URL || '';
    const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
    return res.json({ code, registration_link: `${normalized}/auth/sign-up-3?ref=${encodeURIComponent(code)}` });
  } catch (e) {
    console.error('[referral/links]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET /api/referral/bank-info
app.get('/api/referral/bank-info', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referral_bank_accounts')
      .select('bank_code,account_number,account_name,tax_id')
      .eq('user_id', req.user.id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return res.json({ bank: data || null });
  } catch (e) {
    console.error('[referral/bank-info:get]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// PUT /api/referral/bank-info
// Validates and upserts user bank info. Body: { bank_code, account_number, account_name, tax_id? }
app.put('/api/referral/bank-info', requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      bank_code: z.string().min(2).max(20),
      account_number: z.string().min(5).max(50),
      account_name: z.string().min(2).max(120),
      tax_id: z.string().min(4).max(100).optional().nullable(),
    });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
    }
    const payload = {
      user_id: req.user.id,
      bank_code: parsed.data.bank_code,
      account_number: parsed.data.account_number,
      account_name: parsed.data.account_name,
      tax_id: parsed.data.tax_id || null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('referral_bank_accounts')
      .upsert(payload, { onConflict: 'user_id' })
      .select('bank_code,account_number,account_name,tax_id')
      .single();
    if (error) throw error;
    return res.json({ bank: data });
  } catch (e) {
    console.error('[referral/bank-info:put]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET /api/referral/commissions
app.get('/api/referral/commissions', requireAuth, async (req, res) => {
  try {
    const status = (req.query.status || '').toString().toLowerCase();
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10) || 10));
    const offset = Math.max(0, parseInt(req.query.offset || '0', 10) || 0);
    let query = supabase
      .from('referral_commissions')
      .select('id,amount,currency,status,transaction_id,referred_user_id,created_at', { count: 'exact' })
      .eq('referrer_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (status && ['approved', 'paid', 'pending', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }
    const { data, count, error } = await query;
    if (error) throw error;
    return res.json({ rows: data || [], total: count || 0, limit, offset });
  } catch (e) {
    console.error('[referral/commissions]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET /api/referral/withdrawals
app.get('/api/referral/withdrawals', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referral_withdrawals')
      .select('id,amount,status,created_at,processed_at,method')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ rows: data || [] });
  } catch (e) {
    console.error('[referral/withdrawals:get]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// POST /api/referral/withdrawals
app.post('/api/referral/withdrawals', requireAuth, async (req, res) => {
  try {
    // bank info required
    const { data: bank } = await supabase
      .from('referral_bank_accounts')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!bank) return res.status(400).json({ message: 'Lengkapi bank information terlebih dahulu.' });

    const { balance } = await referralBalance(req.user.id);
    if (balance < REFERRAL_MIN_WITHDRAW) {
      return res.status(400).json({ message: `Minimal penarikan ${REFERRAL_MIN_WITHDRAW}` });
    }

    const { data: wd, error: insErr } = await supabase
      .from('referral_withdrawals')
      .insert({
        user_id: req.user.id,
        amount: balance,
        status: 'requested',
        method: 'bank_transfer',
        bank_snapshot: bank,
      })
      .select('*')
      .single();
    if (insErr) throw insErr;

    const { error: updErr } = await supabase
      .from('referral_commissions')
      .update({ status: 'paid', paid_withdrawal_id: wd.id })
      .eq('referrer_id', req.user.id)
      .eq('status', 'approved');
    if (updErr) console.warn('[referral/withdrawals] update commissions warn', updErr?.message || updErr);

    return res.json({ ok: true, withdrawal: wd });
  } catch (e) {
    console.error('[referral/withdrawals:post]', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// ===== Commission processor (simplified) =====
async function processPaidTransaction(txId) {
  try {
    const { data: tx, error: txErr } = await supabase.from('transactions').select('*').eq('id', txId).single();
    if (txErr || !tx) return console.warn('[commission] tx not found', txId);
    if (tx.status !== 'PAID') return console.warn('[commission] tx not PAID', txId);
    if (REFERRAL_ALLOWED_PAYMENT_METHODS.length && tx.payment_channel && !REFERRAL_ALLOWED_PAYMENT_METHODS.includes(tx.payment_channel)) {
      return console.log('[commission] payment channel not eligible', tx.payment_channel);
    }
    // attribution priority
    let code = (tx.referral_code || '').trim();
    if (!code && tx.kind === 'course' && tx.ref_id) {
      const { data: enr } = await supabase
        .from('enrollments')
        .select('referral_used')
        .eq('user_id', tx.user_id)
        .eq('course_id', tx.ref_id)
        .order('enrolled_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      code = (enr?.referral_used || '').trim();
    }
    if (!code) {
      const { data: buyer } = await supabase.from('users').select('referred_by').eq('id', tx.user_id).single();
      code = (buyer?.referred_by || '').trim();
    }
    if (!code) return console.log('[commission] no referral code for tx', txId);

    const { data: referrer } = await supabase.from('users').select('id').eq('referral_code', code).maybeSingle();
    if (!referrer?.id) return console.log('[commission] referrer not found for code', code);
    if (referrer.id === tx.user_id) return console.warn('[commission] self-referral ignored', txId);

    const amount = Math.floor(Number(tx.amount || 0) * REFERRAL_COMMISSION_PCT);
    if (!(amount > 0)) return console.log('[commission] zero amount, skip', txId);

    const insert = {
      referrer_id: referrer.id,
      referred_user_id: tx.user_id,
      transaction_id: tx.id,
      amount,
      currency: tx.currency || 'IDR',
      status: 'approved',
    };
    const { error: insErr } = await supabase.from('referral_commissions').insert(insert);
    if (insErr) {
      const msg = (insErr && insErr.message) || '';
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
        console.warn('[commission] duplicate for tx', txId);
      } else {
        console.error('[commission] insert failed', insErr);
      }
    }
  } catch (e) {
    console.error('[commission] processor error', e);
  }
}

async function handleRefundOrFail(txId) {
  try {
    const { data: com } = await supabase
      .from('referral_commissions')
      .select('id,status')
      .eq('transaction_id', txId)
      .maybeSingle();
    if (!com) return; // nothing
    if (com.status === 'paid') {
      console.warn('[commission] refund after paid - requires manual reconcile', txId);
      return;
    }
    await supabase.from('referral_commissions').update({ status: 'rejected' }).eq('id', com.id);
  } catch (e) {
    console.error('[commission] refund handler error', e);
  }
}

// Dev-only simulate endpoint
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/referral/simulate-paid', requireAdmin, async (req, res) => {
    const txId = Number(req.body?.txId || req.query.txId || 0);
    if (!txId) return res.status(400).json({ message: 'txId required' });
    await processPaidTransaction(txId);
    return res.json({ ok: true });
  });
}

// POST /api/me/avatar
// Upload avatar image for current user (multipart form: field "file").
// Returns: { avatar_url }
app.post('/api/me/avatar', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const ext = mime.extension(file.mimetype || '') || 'png';
    const objectPath = `avatars/${userId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET_MEDIA)
      .upload(objectPath, file.buffer, { contentType: file.mimetype || 'image/png', upsert: false });
    if (upErr) throw upErr;
    const avatarUrl = await getFileUrl(BUCKET_MEDIA, objectPath);
    try {
      const { error: updErr } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (updErr) throw updErr;
    } catch (updErr) {
      const code = updErr && updErr.code;
      const msg = (updErr && updErr.message) || '';
      if (!(code === '42703' || /avatar_url/.test(msg))) {
        throw updErr;
      }
      console.warn('avatar_url column absent; returning URL without persisting. Add avatar_url text to users table.');
    }
    return res.json({ avatar_url: avatarUrl });
  } catch (e) {
    console.error('POST /api/me/avatar failed', e);
    return res.status(500).json({ message: e?.message || 'Upload failed' });
  }
});

// ====== App (user) endpoints - requireAuth ======


// ====== Referral: Links ======
// GET /api/referral/links -> { code, registration_link }
app.get('/api/referral/links', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, referral_code')
      .eq('id', userId)
      .single();
    if (error) throw error;

    let code = user?.referral_code || null;
    if (!code) {
      const base = (user?.username || `U${userId}`).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      code = `${base || 'AFF'}${suffix}`.toUpperCase();
      const { error: updErr } = await supabase
        .from('users')
        .update({ referral_code: code, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (updErr) {
        console.warn('Failed to set referral_code, proceeding with computed code', updErr.message || updErr);
      }
    }

    const registration_link = `${PUBLIC_BASE_URL}/auth/sign-up-3?ref=${encodeURIComponent(code)}`;
    return res.json({ code, registration_link });
  } catch (e) {
    console.error('GET /api/referral/links failed', e);
    return res.status(500).json({ message: e?.message || 'Failed' });
  }
});

// ====== Referral: Stats ======
// GET /api/referral/stats -> { balance, totalApproved, totalPaid, withdrawable, minWithdraw }
app.get('/api/referral/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { data: rows, error } = await supabase
      .from('referral_commissions')
      .select('amount,status')
      .eq('referrer_id', userId)
      .in('status', ['approved', 'paid']);
    if (error) throw error;

    let totalApproved = 0;
    let totalPaid = 0;
    for (const r of rows || []) {
      const amt = Number(r?.amount || 0);
      if (r?.status === 'approved') totalApproved += amt;
      if (r?.status === 'paid') totalPaid += amt;
    }
    const balance = Math.max(0, totalApproved - totalPaid);
    const withdrawable = Math.max(0, balance);
    const minWithdraw = REFERRAL_MIN_WITHDRAW;
    return res.json({ balance, totalApproved, totalPaid, withdrawable, minWithdraw });
  } catch (e) {
    console.error('GET /api/referral/stats failed', e);
    return res.status(500).json({ message: e?.message || 'Failed' });
  }
});

// ====== Referral: Bank Info ======
// GET /api/referral/bank-info
app.get('/api/referral/bank-info', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { data, error } = await supabase
      .from('referral_bank_accounts')
      .select('user_id, bank_name, account_name, account_number, bank_code, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error && error.code && error.code !== 'PGRST116') throw error;
    return res.json(data || null);
  } catch (e) {
    console.error('GET /api/referral/bank-info failed', e);
    return res.status(500).json({ message: e?.message || 'Failed' });
  }
});

// PUT /api/referral/bank-info (upsert)
app.put('/api/referral/bank-info', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const schema = z.object({
      bank_name: z.string().min(2).max(100),
      account_name: z.string().min(2).max(120),
      account_number: z.string().min(5).max(50),
      bank_code: z.string().min(2).max(20).optional().nullable(),
    });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.flatten() });
    }
    const payload = parsed.data;

    const up = {
      user_id: userId,
      bank_name: payload.bank_name,
      account_name: payload.account_name,
      account_number: payload.account_number,
      bank_code: payload.bank_code ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('referral_bank_accounts')
      .upsert(up, { onConflict: 'user_id' })
      .select('user_id, bank_name, account_name, account_number, bank_code, updated_at')
      .single();
    if (error) throw error;
    return res.json(data);
  } catch (e) {
    console.error('PUT /api/referral/bank-info failed', e);
    return res.status(500).json({ message: e?.message || 'Failed' });
  }
});

// Helpers for role ordering (free < beginer < intermediate < advanced)
const ROLE_ORDER = { free: 0, beginer: 1, intermediate: 2, advanced: 3 };
function roleRank(r) {
  const key = String(r || '').toLowerCase();
  if (key === 'admin') return ROLE_ORDER.advanced; // admin gets max access
  return ROLE_ORDER[key] ?? 0;
}

// GET /api/app/courses
app.get('/api/app/courses', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10) || 12));
    const sort = (req.query.sort || 'updated_at.desc').toString();
    const q = (req.query.q || '').toString();
    const min_role = req.query.min_role ? String(req.query.min_role) : null;
    const rawLevel = (req.query.level || req.query.course_level || '').toString().toLowerCase().trim();
    const allowedLevels = ['beginer', 'intermediate', 'advanced'];
    const level = allowedLevels.includes(rawLevel) ? rawLevel : null;

    // Ensure verified user
    const { data: verUser } = await supabase
      .from('users')
      .select('is_verified, role, membership_tier')
      .eq('id', req.user?.id)
      .single();
    if (!verUser?.is_verified) {
      return res.status(403).json({ message: 'Please verify your email' });
    }

    // sorting
    const allowed = new Set(['updated_at', 'created_at', 'price', 'title', 'id']);
    let by = 'updated_at';
    let asc = false;
    if (sort) {
      const [c, d] = sort.split('.');
      if (allowed.has(c)) {
        by = c; asc = (d || 'desc').toLowerCase() === 'asc';
      }
    }

    // fetch all published (we may filter in memory by role)
    let query = supabase
      .from('courses')
      .select('id,title,description,price,thumbnail_url,min_tier,course_level,created_at,updated_at', { count: 'exact' })
      .eq('is_published', true)
      .order(by, { ascending: asc });
    if (q) query = query.ilike('title', `%${q}%`);
    if (min_role) {
      const mt = roleToTierCompat(min_role);
      if (mt) query = query.eq('min_tier', mt);
    }
    if (level) query = query.eq('course_level', level);

    const { data, error } = await query;
    if (error) throw error;

    // Tier-based gating using membership_tiers.sort_order
    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select('code,sort_order,name,badge_color,is_active');
    const map = Object.create(null);
    (tiers || []).forEach((t) => { map[t.code] = t; });
    const userTierCode = verUser?.membership_tier || 'FREE';
    const userSort = map[userTierCode]?.sort_order ?? 1;
    const filtered = (data || [])
      .filter((c) => (map[c.min_tier]?.sort_order ?? 1) <= userSort)
      .map((c) => ({
        ...c,
        min_role: tierToRole(c.min_tier),
        min_tier_name: map[c.min_tier]?.name || c.min_tier,
        min_tier_badge_color: map[c.min_tier]?.badge_color || null,
      }));

    const total = filtered.length;
    const from = (page - 1) * limit;
    const to = from + limit;
    const rows = filtered.slice(from, to);

    return res.json({ page, limit, total, rowsCount: rows.length, rows });
  } catch (e) {
    console.error('GET /api/app/courses failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// ====== Membership (App scope) ======
// List active plans
app.get('/api/app/membership/plans', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*, membership_tiers:membership_tier_granted(code,name,badge_color,sort_order)')
      .eq('is_active', true)
      .order('price_idr', { ascending: true });
    if (error) throw error;
    // ensure compatibility keys
    const rows = (data || []).map((p) => ({ ...p, tier_meta: p.membership_tiers || null }));
    return res.json({ rows });
  } catch (e) {
    console.error('[APP membership/plans] failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// Create Xendit invoice for membership
app.post('/api/app/membership/checkout', requireAuth, async (req, res) => {
  try {
    const { plan_id } = req.body || {};
    if (!plan_id) return res.status(400).json({ message: 'plan_id is required' });

    const { data: plan, error: planErr } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', plan_id)
      .single();
    if (planErr || !plan || !plan.is_active) return res.status(400).json({ message: 'Invalid plan' });

    const batch = await getActiveBatch().catch(() => null);

    const externalId = `m-${req.user.id}-${plan_id}-${Date.now()}`;
    const { data: tx, error: txErr } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: req.user.id,
          kind: 'membership',
          ref_id: plan_id,
          amount: plan.price_idr,
          status: 'PENDING',
          gateway: 'xendit',
          external_id: externalId,
          currency: 'IDR',
        },
      ])
      .select()
      .single();
    if (txErr) throw txErr;

    const xKey = process.env.XENDIT_SECRET_KEY;
    if (!xKey) return res.status(500).json({ message: 'Missing XENDIT_SECRET_KEY' });
    const successUrl = `${process.env.APP_BASE_URL || ''}/user?tab=membership&invoice=success`;
    const failureUrl = `${process.env.APP_BASE_URL || ''}/user?tab=membership&invoice=failed`;

    const invRes = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(xKey + ':').toString('base64'),
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: Number(plan.price_idr),
        payer_email: req.user?.email || undefined,
        description: `Membership ${plan.name} (${plan.role_granted})`,
        success_redirect_url: successUrl,
        failure_redirect_url: failureUrl,
        currency: 'IDR',
      }),
    });
    if (!invRes.ok) {
      const t = await invRes.text();
      throw new Error(`Xendit error: ${invRes.status} ${t}`);
    }
    const invoice = await invRes.json();

    await supabase
      .from('transactions')
      .update({ invoice_id: invoice?.id || null })
      .eq('id', tx.id);

    await supabase
      .from('user_memberships')
      .insert([
        {
          user_id: req.user.id,
          plan_id: plan.id,
          batch_id: batch?.id || null,
          status: 'pending',
          amount: plan.price_idr,
          xendit_invoice_id: invoice?.id || null,
        },
      ]);

    return res.json({ invoice, transaction: tx });
  } catch (e) {
    console.error('[APP membership/checkout] failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// Active membership for current user
app.get('/api/app/membership/active', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_memberships')
      .select('*, membership_plans(*), batches(*)')
      .eq('user_id', req.user.id)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return res.json({ active: data?.[0] || null });
  } catch (e) {
    console.error('[APP membership/active] failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});
// Alias: PATCH/PUT /api/app/me to update current user's profile
app.put('/api/app/me', requireAuth, async (req, res) => {
  // Reuse /api/app/profile implementation
  req.url = '/api/app/profile';
  return app._router.handle(req, res, () => {});
});

// GET /api/app/enrollments
app.get('/api/app/enrollments', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { data, error, count } = await supabase
      .from('enrollments')
      .select('id, payment_status, enrolled_at, courses(id,title,price,min_tier)', { count: 'exact' })
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map((r) => ({
      id: r.id,
      payment_status: r.payment_status,
      enrolled_at: r.enrolled_at,
      course: r.courses ? { ...r.courses, min_role: tierToRole(r.courses.min_tier) } : null,
    }));
    return res.json({ rows, total: count || rows.length });
  } catch (e) {
    console.error('GET /api/app/enrollments failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// GET /api/app/tickets
app.get('/api/app/tickets', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { data, error, count } = await supabase
      .from('event_purchases')
      .select('id, payment_status, purchased_at, quantity, total_amount, events(id,title,event_date,location,is_online,price,banner_url)', { count: 'exact' })
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map((r) => ({
      id: r.id,
      payment_status: r.payment_status,
      purchased_at: r.purchased_at,
      quantity: r.quantity,
      total_amount: r.total_amount,
      event: r.events || null,
    }));
    return res.json({ rows, total: count || rows.length });
  } catch (e) {
    console.error('GET /api/app/tickets failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// PUT /api/app/profile
app.put('/api/app/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, username, phone, address, job, batch, discord_id } = req.body || {};

    // If username provided, ensure unique
    if (username !== undefined && username !== null && username !== '') {
      const { data: exists, error: exErr } = await supabase
        .from('users')
        .select('id')
        .eq('username', String(username))
        .neq('id', userId)
        .maybeSingle();
      if (exErr) {
        // continue only if not an actual error (maybeSingle returns null when not found)
        if (exErr.code && exErr.code !== 'PGRST116') throw exErr;
      }
      if (exists && exists.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const patch = {};
    if (name !== undefined) patch.name = name === null ? null : String(name);
    if (username !== undefined) patch.username = username === null ? null : String(username);
    if (phone !== undefined) patch.phone = phone === null ? null : String(phone);
    if (address !== undefined) patch.address = address === null ? null : String(address);
    if (job !== undefined) patch.job = job === null ? null : String(job);
    if (batch !== undefined) patch.batch = batch === null ? null : String(batch);
    if (discord_id !== undefined) patch.discord_id = discord_id === null ? null : String(discord_id);
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', userId)
      .select('id, username, email, name, role, is_verified, discord_id, phone, address, job, batch, membership_expires_at, referred_by, referral_code, created_at, updated_at')
      .single();
    if (error) throw error;
    return res.json({ ok: true, user: data });
  } catch (e) {
    console.error('PUT /api/app/profile failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// PUT /api/app/password
app.put('/api/app/password', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { old_password, new_password } = req.body || {};
    if (!old_password || !new_password) {
      return res.status(400).json({ message: 'old_password and new_password are required' });
    }
    const { data: user, error } = await supabase
      .from('users')
      .select('id, password')
      .eq('id', userId)
      .single();
    if (error || !user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const okPass = await bcrypt.compare(String(old_password), user.password || '');
    if (!okPass) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }
    const hashed = await bcrypt.hash(String(new_password), 10);
    const { error: upErr } = await supabase
      .from('users')
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (upErr) throw upErr;
    return res.json({ ok: true });
  } catch (e) {
    console.error('PUT /api/app/password failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// POST /api/auth/logout - Clear auth cookie on logout
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
});

// Apply auth guard for all admin routes
// ====== Routes publik (punya kamu sebelumnya) ======

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function generateVerificationToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 6; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}
// Map untuk resend (bugfix: sebelumnya belum dideklarasikan)
const userTokens = new Map();

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, name, email, password, referred_by } = req.body;

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existingUser) return fail(res, 'Email already registered', 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();
    const verificationToken = generateVerificationToken();
    const tokenExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error } = await supabase.from('users').insert([{
      username, name, email,
      password: hashedPassword,
      referred_by,
      referral_code: referralCode,
      is_verified: false,
      verification_token: verificationToken,
      token_expired_at: tokenExpiredAt,
    }]);
    if (error) throw error;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
        <div style="max-width:480px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.1);">
          <div style="background:linear-gradient(90deg,#007bff,#00aaff);padding:20px;text-align:center;color:#fff;">
            <h1 style="margin:0;">Stockwise</h1>
            <p style="margin:5px 0 0;">Account Verification</p>
          </div>
          <div style="padding:30px;text-align:center;">
            <h2 style="color:#333;">Hello, ${name}!</h2>
            <p style="color:#555;">Here is your verification code:</p>
            <div style="margin:20px 0;font-size:32px;font-weight:bold;letter-spacing:8px;color:#007bff;">
              ${verificationToken}
            </div>
            <p style="color:#999;">This code will expire in 24 hours.</p>
          </div>
        </div>
      </div>
    `;
    await transporter.sendMail({
      from: `"Stockwise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Stockwise Verification Code',
      html: htmlContent,
    });
    return ok(res, { message: 'Registration successful! Verification code sent to email.' }, 201);
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// Resend verification
app.post('/api/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 'Email is required', 400);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    userTokens.set(email, code);

    await transporter.sendMail({
      from: `"Stockwise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family:Arial,sans-serif;color:#333;">
          <h2 style="color:#0070F3;">Stockwise Verification</h2>
          <p>Your verification code:</p>
          <div style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#0070F3;">${code}</div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });
    return ok(res, { message: 'Verification code sent successfully' });
  } catch (error) {
    console.error(error);
    return fail(res, 'Failed to send verification code');
  }
});

// Verify code
app.post('/api/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (error || !user) return fail(res, 'User not found', 400);
    if (user.is_verified) return fail(res, 'User already verified', 400);
    if (new Date(user.token_expired_at) < new Date()) return fail(res, 'Verification code expired', 400);
    if (user.verification_token !== code) return fail(res, 'Invalid verification code', 400);

    const { error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true, verification_token: null, token_expired_at: null })
      .eq('id', user.id);
    if (updateError) throw updateError;

    return ok(res, { message: 'Email verified successfully!' });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// ====== Admin CRUD ======

// .env harus punya: SUPABASE_URL, SUPABASE_SERVICE_ROLE (service_role), BUCKET_MEDIA=media
app.post("/api/admin/upload", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ext = mime.extension(req.file.mimetype) || "bin";
    // optional: terima folder lewat query ?dir=courses/thumbs
    const dir = (req.query.dir || "misc").toString().replace(/^\/+|\/+$/g, "");
    const filename = `${Date.now()}-${uuidv4()}.${ext}`;
    const path = `${dir}/${filename}`;

    const { error } = await supabase.storage
      .from(BUCKET_MEDIA)
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    const { data: pub } = supabase.storage
      .from(BUCKET_MEDIA)
      .getPublicUrl(path);

    return res.json({ path, url: pub.publicUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message });
  }
});

// ---- EVENTS ----
app.post('/api/admin/events', requireAdmin, async (req, res) => {
  try {
    const { title, description, event_date, price = 0, location, is_online = true, event_url, is_published = false } = req.body;

    if (!title) return fail(res, 'title is required', 400);

    const payload = {
      title,
      description: description ?? null,
      event_date: event_date ? new Date(event_date).toISOString() : null,
      price: price !== null && price !== undefined ? Number(price) : 0,
      location: location ?? null,
      is_online: parseBool(is_online, true),
      event_url: event_url ?? null, // NOTE: schema belum punya banner_url
      is_published: parseBool(is_published, false),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('events').insert([payload]).select('*').single();
    if (error) throw error;
    return ok(res, data, 201);
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

app.get('/api/admin/events', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, q = '', published, is_online, sort, sort_by, sort_dir } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const from = (p - 1) * l;
    const to = from + l - 1;

    // Sorting
    const allowedSort = new Set(['created_at', 'updated_at', 'event_date', 'price', 'title']);
    let by = 'created_at';
    let asc = false;
    if (typeof sort === 'string' && sort) {
      const [col, dir] = String(sort).split('.');
      if (allowedSort.has(col)) {
        by = col;
        asc = (dir || '').toLowerCase() === 'asc';
      }
    } else if (typeof sort_by === 'string' || typeof sort_dir === 'string') {
      const col = String(sort_by || 'created_at');
      const dir = String(sort_dir || 'desc');
      by = allowedSort.has(col) ? col : 'created_at';
      asc = dir.toLowerCase() === 'asc';
    }

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order(by, { ascending: asc });

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (typeof published !== 'undefined') query = query.eq('is_published', parseBool(published, false));
    if (typeof is_online !== 'undefined') query = query.eq('is_online', parseBool(is_online, true));

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return ok(res, { rows: data || [], page: p, limit: l, total: count || 0 });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

app.get('/api/admin/events/:id', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, err.message, 404);
  }
});

app.put('/api/admin/events/:id', requireAdmin, async (req, res) => {
  try {
    const { title, description, event_date, price, location, is_online, event_url, is_published } = req.body;
    const patch = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(event_date !== undefined && { event_date: event_date ? new Date(event_date).toISOString() : null }),
      ...(price !== undefined && { price: Number(price) }),
      ...(location !== undefined && { location }),
      ...(is_online !== undefined && { is_online: parseBool(is_online) }),
      ...(event_url !== undefined && { event_url }),
      ...(is_published !== undefined && { is_published: parseBool(is_published) }),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('events').update(patch).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

app.delete('/api/admin/events/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('events').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { id: req.params.id });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// Upload banner/gambar event - balikin public URL
app.post('/api/admin/events/:id/banner', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return fail(res, 'file is required (multipart/form-data, field: file)', 400);
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const key = `events/banners/${req.params.id}/${uuidv4()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET_MEDIA)
      .upload(key, req.file.buffer, { cacheControl: '3600', upsert: true, contentType: req.file.mimetype });

    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(BUCKET_MEDIA).getPublicUrl(key);
    // NOTE: schema belum ada kolom banner_url. Sementara bisa simpan ke event_url jika mau:
    // await supabase.from('events').update({ event_url: pub.publicUrl }).eq('id', req.params.id);

    return ok(res, { url: pub.publicUrl, path: key });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// ---- COURSES ----
app.post('/api/admin/courses', requireAdmin, async (req, res) => {
  try {
    const { title, description, is_published = false } = req.body || {};
    // accept either min_tier directly or legacy min_role then map to tier
    const min_tier = req.body?.min_tier || roleToTierCompat(req.body?.min_role);
    if (!title) {
      return fail(res, 'title is required', 400);
    }

    const priceNumber = toNumberSafe(req.body?.price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    // course_level validation
    const allowedLevels = ['beginer','intermediate','advanced'];
    const bodyLevel = (req.body?.course_level || '').toString().toLowerCase();
    if (!allowedLevels.includes(bodyLevel)) {
      return res.status(400).json({ message: 'Invalid course_level' });
    }

    const now = new Date().toISOString();
    const payload = {
      title,
      description: description ?? null,
      price: priceNumber,
      is_published: parseBool(is_published, false),
      min_tier,
      course_level: bodyLevel,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('courses')
      .insert([payload])
      .select('id,title,description,price,is_published,min_tier,course_level,created_at,updated_at')
      .single();

    if (error) {
      console.error('Insert course failed', error);
      return fail(res, error.message || 'Failed to create course', 500);
    }

    // include computed legacy field for UI compatibility
    const row = data ? { ...data, min_role: tierToRole(data.min_tier) } : data;
    return res.status(201).json({ ok: true, row });
  } catch (err) {
    console.error(err);
    return fail(res, err?.message || 'Failed to create course');
  }
});

// [ADMIN API] List courses with filters/sorts (include tier meta)
app.get('/api/admin/courses', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const q = (req.query.q || '').toString().trim();
    const published = req.query.published?.toString().trim();
    const min_role = (req.query.min_role || '').toString().trim();
    const min_tier_q = (req.query.min_tier || '').toString().trim();
    const sort_by = (req.query.sort_by || 'created_at').toString().trim();
    const sort_dir = (req.query.sort_dir || 'desc').toString().trim();

    const allowedSort = new Set(['created_at', 'price', 'title', 'updated_at']);
    const by = allowedSort.has(sort_by) ? sort_by : 'created_at';
    const asc = sort_dir.toLowerCase() === 'asc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('courses')
      .select('id, title, description, price, is_published, min_tier, course_level, created_at, updated_at, thumbnail_url', { count: 'exact' })
      .order(by, { ascending: asc })
      .range(from, to);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (published === 'true') query = query.eq('is_published', true);
    if (published === 'false') query = query.eq('is_published', false);
    // support both min_tier and legacy min_role
    if (min_tier_q) query = query.eq('min_tier', min_tier_q.toUpperCase());
    if (min_role && !min_tier_q) {
      const mt = roleToTierCompat(min_role);
      if (mt) query = query.eq('min_tier', mt);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error('[ADMIN /courses] select error:', error);
      return res.status(500).json({ message: error.message });
    }
    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select('code,name,badge_color');
    const map = Object.create(null);
    (tiers || []).forEach((t) => { map[t.code] = t; });
    const rows = (data || []).map((r) => ({
      ...r,
      min_role: tierToRole(r.min_tier),
      min_tier_name: map[r.min_tier]?.name || r.min_tier,
      min_tier_badge_color: map[r.min_tier]?.badge_color || null,
    }));
    return res.json({
      page,
      limit,
      total: count ?? 0,
      rows,
    });
  } catch (e) {
    console.error('[ADMIN /courses] unexpected error:', e);
    return res.status(500).json({ message: e.message });
  }
});

// [ADMIN API] Update course (title, desc, price, min_role, is_published)
app.put('/api/admin/courses/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, price, is_published } = req.body || {};

    const patch = {};
    if (title !== undefined) patch.title = String(title);
    if (description !== undefined) patch.description = description === null ? null : String(description);
    if (price !== undefined) {
      const num = Number(price);
      if (!Number.isFinite(num) || num < 0) {
        return res.status(400).json({ message: 'Price invalid' });
      }
      patch.price = Number(num.toFixed(2));
    }
    // accept min_tier or legacy min_role -> map to min_tier
    if (req.body?.min_tier !== undefined) {
      patch.min_tier = String(req.body.min_tier).toUpperCase();
    } else if (req.body?.min_role !== undefined) {
      patch.min_tier = roleToTierCompat(req.body.min_role);
    }
    // optional course_level update with validation
    if (typeof req.body?.course_level === 'string') {
      const lv = req.body.course_level.toLowerCase();
      const allowedLevels = ['beginer','intermediate','advanced'];
      if (!allowedLevels.includes(lv)) {
        return res.status(400).json({ message: 'Invalid course_level' });
      }
      patch.course_level = lv;
    }
    if (is_published !== undefined) patch.is_published = !!is_published;

    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('courses')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[ADMIN /courses/:id] update error:', error);
      return res.status(500).json({ message: error.message });
    }

    const row = data ? { ...data, min_role: tierToRole(data.min_tier) } : data;
    return res.json(row);
  } catch (e) {
    console.error('[ADMIN /courses/:id] unexpected error:', e);
    return res.status(500).json({ message: e.message });
  }
});

app.delete('/api/admin/courses/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('courses').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { id: req.params.id });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// Upload thumbnail course
app.post('/api/admin/courses/:id/thumbnail', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Missing course id' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file' });
    }

    const bucket = BUCKET_MEDIA;
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const objectPath = `courses/${id}/thumb_${Date.now()}.${ext}`;

    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(objectPath, req.file.buffer, {
        upsert: true,
        contentType: req.file.mimetype || 'image/jpeg',
      });
    if (uploadResult.error) throw uploadResult.error;

    const url = await getFileUrl(bucket, objectPath);

    const updateResult = await supabase
      .from('courses')
      .update({ thumbnail_url: url, thumbnail_path: objectPath })
      .eq('id', id)
      .select('id, thumbnail_url, thumbnail_path')
      .single();
    if (updateResult.error) throw updateResult.error;

    return res.json({ url, path: objectPath, course: updateResult.data });
  } catch (e) {
    console.error('Upload thumbnail failed', e);
    return res.status(500).json({ message: 'Upload thumbnail failed', detail: String(e.message || e) });
  }
});
// ---- VIDEOS (per course) ----
app.post('/api/admin/courses/:courseId/videos', requireAdmin, async (req, res) => {
  try {
    const { title, video_url, order_index = 1, duration_seconds = 0 } = req.body;
    if (!title) return fail(res, 'title is required', 400);
    const payload = {
      course_id: Number(req.params.courseId),
      title,
      video_url: video_url ?? null,
      order_index: Number(order_index) || 1,
      duration_seconds: Number(duration_seconds) || 0,
    };
    const { data, error } = await supabase.from('videos').insert([payload]).select('*').single();
    if (error) throw error;
    return ok(res, data, 201);
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

app.get('/api/admin/courses/:courseId/videos', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('course_id', req.params.courseId)
      .order('order_index', { ascending: true });
    if (error) throw error;

    const rows = Array.isArray(data) ? data.map((row) => ({ ...row })) : [];
    const isPublic = await isBucketPublic();

    if (isPublic) {
      rows.forEach((row) => {
        row.storage_path = row.video_url ?? null;
      });
    } else {
      await Promise.all(
        rows.map(async (row) => {
          const originalPath = row.video_url ?? null;
          row.storage_path = originalPath;
          if (!originalPath) {
            row.video_url = null;
            return;
          }
          if (originalPath.startsWith('http')) {
            row.video_url = originalPath;
            return;
          }
          const { data: signed, error: signedErr } = await supabase.storage
            .from(BUCKET_MEDIA)
            .createSignedUrl(originalPath, 60 * 60 * 24 * 365);
          if (signedErr) {
            console.warn('createSignedUrl failed when listing videos', signedErr.message);
            row.video_url = null;
          } else {
            row.video_url = signed?.signedUrl || null;
          }
        })
      );
    }

    return ok(res, rows);
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

app.put('/api/admin/videos/:id', requireAdmin, async (req, res) => {
  try {
    const { title, video_url, order_index, duration_seconds } = req.body;
    const patch = {
      ...(title !== undefined && { title }),
      ...(video_url !== undefined && { video_url }),
      ...(order_index !== undefined && { order_index: Number(order_index) }),
      ...(duration_seconds !== undefined && { duration_seconds: Number(duration_seconds) }),
    };
    const { data, error } = await supabase.from('videos').update(patch).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

app.delete('/api/admin/videos/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('videos').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { id: req.params.id });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// Upload file video - balikin URL, simpan sendiri ke videos.video_url
app.post('/api/admin/videos/:id/upload', requireAdmin, videoUpload.single('file'), async (req, res) => {
  let tmpPath = null;
  try {
    if (!req.file) return fail(res, 'file is required', 400);

    tmpPath = req.file.path || null;
    const videoId = Number(req.params.id);
    if (!Number.isFinite(videoId)) {
      return fail(res, 'Invalid video id', 400);
    }

    const { data: videoRow, error: videoErr } = await supabase
      .from('videos')
      .select('id, course_id')
      .eq('id', videoId)
      .single();
    if (videoErr || !videoRow) {
      return fail(res, 'Video not found', 404);
    }

    const ext = (path.extname(req.file.originalname) || '.mp4').toLowerCase();
    const slug = slugifyFilename(req.file.originalname);
    const objectName = `videos/${videoRow.course_id}/${videoRow.id}-${slug}${ext}`;

    const fileBuffer = await fsPromises.readFile(tmpPath);

    const durationSeconds = await probeDurationSec(tmpPath);
    if (!durationSeconds) {
      console.warn('Duration unavailable for video', { videoId, file: req.file.originalname });
    }

    const { error: upErr } = await supabase.storage
      .from(BUCKET_MEDIA)
      .upload(objectName, fileBuffer, {
        cacheControl: `${60 * 60 * 24 * 365}`,
        upsert: true,
        contentType: req.file.mimetype,
      });
    if (upErr) throw upErr;

    const isPublic = await isBucketPublic();
    let responseUrl = null;
    let storedUrl = objectName;

    if (isPublic) {
      const { data: pubData } = supabase.storage.from(BUCKET_MEDIA).getPublicUrl(objectName);
      responseUrl = pubData?.publicUrl || null;
      storedUrl = responseUrl || objectName;
    } else {
      const { data: signed, error: signedErr } = await supabase.storage
        .from(BUCKET_MEDIA)
        .createSignedUrl(objectName, 60 * 60 * 24 * 365);
      if (signedErr) {
        console.warn('createSignedUrl failed', signedErr.message);
      } else {
        responseUrl = signed?.signedUrl || null;
      }
    }

    const patch = {
      video_url: storedUrl,
      duration_seconds: durationSeconds || 0,
    };

    const { error: updateErr } = await supabase.from('videos').update(patch).eq('id', videoId);
    if (updateErr) throw updateErr;

    console.log('[VIDEO UPLOAD]', {
      videoId,
      courseId: videoRow.course_id,
      path: objectName,
      durationSeconds,
    });

    return ok(res, {
      url: responseUrl || storedUrl,
      path: objectName,
      duration_seconds: durationSeconds || 0,
      size: req.file.size,
      mime: req.file.mimetype,
    });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  } finally {
    if (tmpPath) {
      try {
        await fsPromises.unlink(tmpPath);
      } catch {}
    }
  }
});

// ---- USERS (read-only list untuk admin table) ----
// [ADMIN API] List users
// [ADMIN API] List users with filters/sorts
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const q = (req.query.q || '').toString().trim();
    const role = (req.query.role || '').toString().trim();
    const verified = req.query.verified?.toString().trim();
    const sort_by = (req.query.sort_by || 'created_at').toString().trim();
    const sort_dir = (req.query.sort_dir || 'desc').toString().trim();

    const allowedSort = new Set(['created_at', 'name', 'email', 'role', 'is_verified', 'updated_at']);
    const by = allowedSort.has(sort_by) ? sort_by : 'created_at';
    const asc = sort_dir.toLowerCase() === 'asc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('id, name, email, username, role, is_verified, membership_tier, membership_expires_at, created_at, updated_at', { count: 'exact' })
      .order(by, { ascending: asc })
      .range(from, to);

    if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,username.ilike.%${q}%`);
    if (role) query = query.eq('role', role);
    if (verified === 'true') query = query.eq('is_verified', true);
    if (verified === 'false') query = query.eq('is_verified', false);

    const { data, error, count } = await query;
    if (error) {
      console.error('[ADMIN /users] select error:', error);
      return res.status(500).json({ message: error.message });
    }

    return res.json({
      page,
      limit,
      total: count ?? 0,
      rows: data ?? [],
    });
  } catch (e) {
    console.error('[ADMIN /users] unexpected error:', e);
    return res.status(500).json({ message: e.message });
  }
});

// ====== Public: Courses (no auth) ======
// GET /api/public/courses
app.get('/api/public/courses', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { page = '1', limit = '12', q = '', min_role = '', sort = 'updated_at.desc' } = req.query;
    const rawLevel = (req.query.level || req.query.course_level || '').toString().toLowerCase().trim();
    const allowed = ['beginer','intermediate','advanced'];
    const level = allowed.includes(rawLevel) ? rawLevel : null;
    try { console.log('[GET /api/public/courses] level=', level); } catch {}
    const { page: pageNum, limit: limitNum, from, to } = parsePagination({ page, limit });
    const { col, dir } = parseSort(String(sort || ''));

    let query = supabase
      .from('courses')
      .select('id,title,description,price,thumbnail_url,min_tier,course_level,created_at,updated_at', { count: 'exact' })
      .eq('is_published', true)
      .order(col, { ascending: dir === 'asc' });

    if (q) {
      // title OR description match
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (min_role) {
      const mt = roleToTierCompat(min_role);
      if (mt) query = query.eq('min_tier', mt);
    }
    if (level) query = query.eq('course_level', level);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    // Gating for public: treat user tier as FREE, return tier metadata
    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select('code,sort_order,name,badge_color');
    const map = Object.create(null);
    (tiers || []).forEach((t) => { map[t.code] = t; });
    const userSort = map['FREE']?.sort_order ?? 1;
    const rows = (data || [])
      .filter((r) => (map[r.min_tier]?.sort_order ?? 1) <= userSort)
      .map((r) => ({
        ...r,
        min_role: tierToRole(r.min_tier),
        min_tier_name: map[r.min_tier]?.name || r.min_tier,
        min_tier_badge_color: map[r.min_tier]?.badge_color || null,
      }));
    return res.json({
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      rowsCount: Array.isArray(rows) ? rows.length : 0,
      rows: rows || [],
    });
  } catch (err) {
    console.error('Public list courses failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET /api/public/courses/:id
app.get('/api/public/courses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    const { data, error } = await supabase
      .from('courses')
      .select('id,title,description,price,thumbnail_url,min_tier,created_at,updated_at')
      .eq('id', id)
      .eq('is_published', true)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Not found' });
    const { data: t } = await supabase.from('membership_tiers').select('code,name,badge_color').eq('code', data.min_tier).maybeSingle();
    const row = data ? { ...data, min_role: tierToRole(data.min_tier), min_tier_name: t?.name || data.min_tier, min_tier_badge_color: t?.badge_color || null } : data;
    return res.json(row);
  } catch (err) {
    console.error('Public get course failed', err);
    return res.status(404).json({ message: 'Not found' });
  }
});

// ====== App: Course detail + progress ======
// GET course + videos + user progress map
app.get('/api/app/courses/:courseId', requireAuth, async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isFinite(courseId) || courseId <= 0) return res.status(404).json({ message: 'Not found' });

    // Course (published)
    const { data: course, error: e1 } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('is_published', true)
      .single();
    if (e1 || !course) return res.status(404).json({ message: 'Course not found' });

    // Videos
    const { data: videos, error: e2 } = await supabase
      .from('videos')
      .select('id,title,video_url,order_index,duration_seconds,created_at')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    if (e2) throw e2;

    const ids = (videos || []).map((v) => v.id);
    let progressMap = {};
    if (ids.length > 0) {
      const { data: progresses, error: e3 } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', req.user.id)
        .in('video_id', ids);
      if (e3) throw e3;
      progressMap = (progresses || []).reduce((m, r) => {
        m[r.video_id] = {
          video_id: r.video_id,
          last_position_seconds: (typeof r.last_position_seconds === 'number' ? r.last_position_seconds : r.watched_seconds) || 0,
          watched_seconds: r.watched_seconds || 0,
          is_completed: !!r.is_completed,
          updated_at: r.updated_at,
        };
        return m;
      }, {});
    }

    return res.json({ course, videos: videos || [], progress: progressMap });
  } catch (err) {
    console.error('GET /api/app/courses/:courseId failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET course completion ratio (0..1)
app.get('/api/app/courses/:courseId/progress', requireAuth, async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isFinite(courseId) || courseId <= 0) return res.status(404).json({ message: 'Not found' });

    const { data: videos, error: e1 } = await supabase
      .from('videos')
      .select('id,duration_seconds')
      .eq('course_id', courseId);
    if (e1) throw e1;

    const ids = (videos || []).map((v) => v.id);
    let progresses = [];
    if (ids.length > 0) {
      const r = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', req.user.id)
        .in('video_id', ids);
      if (r.error) throw r.error;
      progresses = r.data || [];
    }
    const map = new Map(progresses.map((p) => [p.video_id, p]));
    const nums = (videos || []).map((v) => {
      const dur = v.duration_seconds || 0;
      const row = map.get(v.id);
      const last = (typeof row?.last_position_seconds === 'number' ? row.last_position_seconds : row?.watched_seconds) || 0;
      return dur > 0 ? Math.min(last / dur, 1) : 0;
    });
    const pct = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    return res.json({ completion_ratio: pct });
  } catch (err) {
    console.error('GET /api/app/courses/:courseId/progress failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// PATCH video progress (heartbeat)
app.patch('/api/app/videos/:videoId/progress', requireAuth, async (req, res) => {
  try {
    const videoId = Number(req.params.videoId);
    const { lastPositionSeconds, isCompleted } = req.body || {};
    if (!Number.isFinite(videoId) || videoId <= 0) return res.status(400).json({ message: 'Invalid video id' });

    const { data: v, error: ev } = await supabase
      .from('videos')
      .select('duration_seconds')
      .eq('id', videoId)
      .single();
    if (ev) throw ev;
    const duration = v?.duration_seconds || 0;
    const clamped = Math.max(0, Math.min(Number(lastPositionSeconds || 0), duration || 24 * 3600));
    const done = Boolean(isCompleted) || (duration ? clamped >= Math.max(0, duration - 2) : false);

    // Try upsert with last_position_seconds; if column missing, retry without it
    const base = {
      user_id: req.user.id,
      video_id: videoId,
      watched_seconds: clamped,
      is_completed: done,
      updated_at: new Date().toISOString(),
    };
    let row = null;
    // attempt: upsert with last_position_seconds (if column exists)
    const r1 = await supabase.from('progress').upsert({ ...base, last_position_seconds: clamped }, { onConflict: 'user_id,video_id' }).select().single();
    if (!r1.error && r1.data) {
      row = r1.data;
    } else {
      const msg = String(r1.error?.message || '');
      const code = String(r1.error?.code || '');
      const lastPosMissing = code === '42703' || code === 'PGRST204' || msg.includes('last_position_seconds');
      const noConflictIndex = code === '42P10' || msg.includes('no unique or exclusion constraint');
      if (lastPosMissing) {
        // retry upsert without last_position_seconds
        const r2 = await supabase.from('progress').upsert(base, { onConflict: 'user_id,video_id' }).select().single();
        if (!r2.error && r2.data) {
          row = r2.data;
        } else {
          const msg2 = String(r2.error?.message || '');
          const code2 = String(r2.error?.code || '');
          const noIdx2 = code2 === '42P10' || msg2.includes('no unique or exclusion constraint');
          if (noIdx2) {
            // manual upsert: update-if-exists else insert
            const { data: existing } = await supabase
              .from('progress')
              .select('video_id')
              .eq('user_id', req.user.id)
              .eq('video_id', videoId)
              .maybeSingle();
            if (existing && existing.video_id) {
              const up = await supabase
                .from('progress')
                .update(base)
                .eq('user_id', req.user.id)
                .eq('video_id', videoId)
                .select()
                .single();
              if (up.error) throw up.error;
              row = up.data;
            } else {
              const ins = await supabase
                .from('progress')
                .insert({ ...base, user_id: req.user.id, video_id: videoId })
                .select()
                .single();
              if (ins.error) throw ins.error;
              row = ins.data;
            }
          } else if (r2.error) {
            throw r2.error;
          }
        }
      } else if (noConflictIndex) {
        // manual upsert path (no unique index)
        const { data: existing } = await supabase
          .from('progress')
          .select('video_id')
          .eq('user_id', req.user.id)
          .eq('video_id', videoId)
          .maybeSingle();
        if (existing && existing.video_id) {
          const up = await supabase
            .from('progress')
            .update({ ...base, last_position_seconds: clamped })
            .eq('user_id', req.user.id)
            .eq('video_id', videoId)
            .select()
            .single();
          if (up.error) throw up.error;
          row = up.data;
        } else {
          const ins = await supabase
            .from('progress')
            .insert({ ...base, user_id: req.user.id, video_id: videoId })
            .select()
            .single();
          if (ins.error) throw ins.error;
          row = ins.data;
        }
      } else if (r1.error) {
        throw r1.error;
      }
    }
    return res.json({ ok: true, progress: row });
  } catch (err) {
    console.error('PATCH /api/app/videos/:videoId/progress failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// ====== Public: Events (no auth) ======
// GET /api/public/events
app.get('/api/public/events', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '12',
      sort = 'event_date.asc',
      q = '',
      is_online,
      after,
      before,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const allowed = new Set(['event_date', 'created_at', 'updated_at', 'price', 'title']);
    let by = 'event_date';
    let asc = true;
    if (typeof sort === 'string' && sort) {
      const [c, d] = String(sort).split('.');
      if (allowed.has(c)) {
        by = c;
        asc = (d || 'asc').toLowerCase() === 'asc';
      }
    }

    let query = supabase
      .from('events')
      .select('id,title,description,event_date,price,location,is_online,event_url,is_published,banner_url,created_at,updated_at', { count: 'exact' })
      .eq('is_published', true)
      .order(by, { ascending: asc });

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (typeof is_online !== 'undefined') {
      query = query.eq('is_online', parseBool(is_online, true));
    }
    if (after) {
      query = query.gte('event_date', String(after));
    }
    if (before) {
      query = query.lte('event_date', String(before));
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return res.json({
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      rowsCount: Array.isArray(data) ? data.length : 0,
      rows: data || [],
    });
  } catch (err) {
    console.error('Public list events failed', err);
    return res.status(500).json({ message: err?.message || 'Internal error' });
  }
});

// GET /api/public/events/:id
app.get('/api/public/events/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    const { data, error } = await supabase
      .from('events')
      .select('id,title,description,event_date,price,location,is_online,event_url,is_published,banner_url,created_at,updated_at')
      .eq('id', id)
      .eq('is_published', true)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Not found' });
    return res.json(data);
  } catch (err) {
    console.error('Public get event failed', err);
    return res.status(404).json({ message: 'Not found' });
  }
});

// [ADMIN API] Update user (name, username, role, is_verified)
app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, username, role, is_verified } = req.body || {};

    const patch = {};
    if (name !== undefined) patch.name = name === null ? null : String(name);
    if (username !== undefined) patch.username = username === null ? null : String(username);
    if (role !== undefined) patch.role = String(role);
    if (is_verified !== undefined) patch.is_verified = !!is_verified;
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      console.error('[ADMIN /users/:id] update error:', error);
      return res.status(500).json({ message: error.message });
    }
    return res.json(data);
  } catch (err) {
    console.error('[ADMIN /users/:id] unexpected error:', err);
    return res.status(500).json({ message: err.message });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    return ok(res, { id: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// ---- TRANSACTIONS (event_purchases + relations) ----
app.get('/api/admin/transactions/events', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('event_purchases')
      .select('*, users(*), events(*)')
      .order('purchased_at', { ascending: false });
    if (error) throw error;
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// ---- MEMBERSHIP PLANS (CRUD) ----
app.get('/api/admin/membership-plans', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10) || 20));
    const q = (req.query.q || '').toString().trim();
    const active = req.query.active?.toString();
    const sort = (req.query.sort || 'created_at.desc').toString();
    const [by, dir] = sort.split('.');
    const asc = (dir || 'desc').toLowerCase() === 'asc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('membership_plans')
      .select('*', { count: 'exact' })
      .order(by || 'created_at', { ascending: asc })
      .range(from, to);
    if (q) query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
    if (active === 'true') query = query.eq('is_active', true);
    if (active === 'false') query = query.eq('is_active', false);

    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ page, limit, total: count || 0, rows: data || [] });
  } catch (e) {
    console.error('[ADMIN membership-plans] list failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

app.get('/api/admin/membership-plans/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data, error } = await supabase.from('membership_plans').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Not found' });
    return res.json(data);
  } catch (e) {
    console.error('[ADMIN membership-plans] get failed', e);
    return res.status(404).json({ message: 'Not found' });
  }
});

app.post('/api/admin/membership-plans', requireAdmin, async (req, res) => {
  try {
    const { code, name, role_granted, membership_tier_granted, price_idr, duration_days, description, is_active = true } = req.body || {};
    const tierCode = (membership_tier_granted || role_granted || 'FREE').toString().toUpperCase();
    // validate tier exists
    const { data: tier } = await supabase.from('membership_tiers').select('code').eq('code', tierCode).maybeSingle();
    if (!tier) return res.status(400).json({ message: 'Invalid membership tier' });
    const payload = { code, name, membership_tier_granted: tierCode, price_idr, duration_days, description, is_active };
    const { data, error } = await supabase.from('membership_plans').insert([payload]).select('*').single();
    if (error) throw error;
    return res.json(data);
  } catch (e) {
    console.error('[ADMIN membership-plans] create failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

app.put('/api/admin/membership-plans/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { code, name, role_granted, membership_tier_granted, price_idr, duration_days, description, is_active } = req.body || {};
    const patch = {};
    if (code !== undefined) patch.code = code;
    if (name !== undefined) patch.name = name;
    if (membership_tier_granted !== undefined || role_granted !== undefined) {
      const tierCode = (membership_tier_granted || role_granted).toString().toUpperCase();
      const { data: tier } = await supabase.from('membership_tiers').select('code').eq('code', tierCode).maybeSingle();
      if (!tier) return res.status(400).json({ message: 'Invalid membership tier' });
      patch.membership_tier_granted = tierCode;
    }
    if (price_idr !== undefined) patch.price_idr = price_idr;
    if (duration_days !== undefined) patch.duration_days = duration_days;
    if (description !== undefined) patch.description = description;
    if (is_active !== undefined) patch.is_active = !!is_active;
    const { data, error } = await supabase.from('membership_plans').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return res.json(data);
  } catch (e) {
    console.error('[ADMIN membership-plans] update failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

app.delete('/api/admin/membership-plans/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { error } = await supabase.from('membership_plans').delete().eq('id', id);
    if (error) throw error;
    return ok(res, { id });
  } catch (e) {
    console.error('[ADMIN membership-plans] delete failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// Aliases with path style: /api/admin/membership/plans
app.get('/api/admin/membership/plans', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10) || 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const q = (req.query.q || '').toString().trim();
    const active = req.query.active?.toString();
    const sort = (req.query.sort || 'created_at.desc').toString();
    const [col, dir] = sort.split('.');
    const asc = (dir || 'desc').toLowerCase() === 'asc';

    let query = supabase
      .from('membership_plans')
      .select('*', { count: 'exact' })
      .order(col || 'created_at', { ascending: asc })
      .range(from, to);
    if (q) query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
    if (active === 'true') query = query.eq('is_active', true);
    if (active === 'false') query = query.eq('is_active', false);

    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ page, limit, total: count || 0, rows: data || [] });
  } catch (e) {
    console.error('[ADMIN membership/plans] list failed', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

app.post('/api/admin/membership/plans', requireAdmin, async (req, res) => {
  try {
    const { code, name, role_granted, price_idr, duration_days, description, is_active } = req.body || {};
    if (!code || !name || !role_granted || price_idr === undefined || duration_days === undefined) {
      return res.status(400).json({ message: 'Field wajib: code, name, role_granted, price_idr, duration_days' });
    }
    const payload = {
      code: String(code),
      name: String(name),
      role_granted: String(role_granted),
      price_idr: Number(price_idr),
      duration_days: Number(duration_days),
      description: description ?? null,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    };
    const { data, error } = await supabase.from('membership_plans').insert([payload]).select('*').single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (e) {
    console.error('[ADMIN membership/plans] create failed', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

app.put('/api/admin/membership/plans/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const patch = {};
    const keys = ['code', 'name', 'role_granted', 'price_idr', 'duration_days', 'description', 'is_active'];
    for (const k of keys) {
      if (req.body?.[k] !== undefined) patch[k] = req.body[k];
    }
    if (patch.price_idr !== undefined) patch.price_idr = Number(patch.price_idr);
    if (patch.duration_days !== undefined) patch.duration_days = Number(patch.duration_days);
    const { data, error } = await supabase.from('membership_plans').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return res.json(data);
  } catch (e) {
    console.error('[ADMIN membership/plans] update failed', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

app.delete('/api/admin/membership/plans/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { error } = await supabase.from('membership_plans').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).send();
  } catch (e) {
    console.error('[ADMIN membership/plans] delete failed', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// ---- BATCHES (CRUD) ----
app.get('/api/admin/batches', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10) || 20));
    const q = (req.query.q || '').toString().trim();
    const active = req.query.active?.toString();
    const sort = (req.query.sort || 'created_at.desc').toString();
    const [by, dir] = sort.split('.');
    const asc = (dir || 'desc').toLowerCase() === 'asc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('batches')
      .select('*', { count: 'exact' })
      .order(by || 'created_at', { ascending: asc })
      .range(from, to);
    if (q) query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
    if (active === 'true') query = query.eq('is_active', true);
    if (active === 'false') query = query.eq('is_active', false);

    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ page, limit, total: count || 0, rows: data || [] });
  } catch (e) {
    console.error('[ADMIN batches] list failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

app.get('/api/admin/batches/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data, error } = await supabase.from('batches').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Not found' });
    return res.json(data);
  } catch (e) {
    console.error('[ADMIN batches] get failed', e);
    return res.status(404).json({ message: 'Not found' });
  }
});

app.post('/api/admin/batches', requireAdmin, async (req, res) => {
  try {
    const { code, name, start_date, end_date, is_active = true } = req.body || {};
    const payload = { code, name, start_date, end_date, is_active };
    const { data, error } = await supabase.from('batches').insert([payload]).select('*').single();
    if (error) throw error;
    return res.json(data);
  } catch (e) {
    console.error('[ADMIN batches] create failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

app.put('/api/admin/batches/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { code, name, start_date, end_date, is_active } = req.body || {};
    const patch = {};
    if (code !== undefined) patch.code = code;
    if (name !== undefined) patch.name = name;
    if (start_date !== undefined) patch.start_date = start_date;
    if (end_date !== undefined) patch.end_date = end_date;
    if (is_active !== undefined) patch.is_active = !!is_active;
    const { data, error } = await supabase.from('batches').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return res.json(data);
  } catch (e) {
    console.error('[ADMIN batches] update failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

app.delete('/api/admin/batches/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (error) throw error;
    return ok(res, { id });
  } catch (e) {
    console.error('[ADMIN batches] delete failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// ---- TRANSACTIONS (read-only consolidated list) ----
app.get('/api/admin/transactions', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10) || 20));
    const kind = (req.query.kind || '').toString();
    const status = (req.query.status || '').toString();
    const sort = (req.query.sort || 'created_at.desc').toString();
    const [by, dir] = sort.split('.');
    const asc = (dir || 'desc').toLowerCase() === 'asc';
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('transactions')
      .select('*, users(id, email, username, role)', { count: 'exact' })
      .order(by || 'created_at', { ascending: asc })
      .range(from, to);
    if (kind) query = query.eq('kind', kind);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;
    return res.json({ page, limit, total: count || 0, rows: data || [] });
  } catch (e) {
    console.error('[ADMIN transactions] list failed', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
});

// ---- Webhook: Xendit (stub) ----
app.post('/api/webhooks/xendit', express.json({ type: '*/*' }), async (req, res) => {
  try {
    // Verify callback token
    const cbToken = req.headers['x-callback-token'];
    if (!cbToken || cbToken !== (process.env.XENDIT_CALLBACK_TOKEN || '')) {
      return res.status(401).json({ message: 'Invalid callback token' });
    }

    const payload = req.body || {};
    const eventType = payload?.status || payload?.event || payload?.event_type || 'unknown';
    const signature = String(cbToken);

    // store webhook
    await supabase.from('webhook_events').insert([
      { provider: 'xendit', event_type: eventType, payload, signature, processed: false },
    ]);

    // Best-effort transaction update
    const invoiceId = payload?.id || payload?.data?.id || payload?.invoice_id || null;
    const externalId = payload?.external_id || payload?.data?.external_id || null;
    const status = (payload?.status || payload?.data?.status || '').toString().toUpperCase();
    const paidAt = payload?.paid_at || payload?.data?.paid_at || null;

    if (invoiceId || externalId) {
      let q = supabase.from('transactions').update({});
      if (invoiceId) q = q.eq('invoice_id', invoiceId);
      if (externalId) q = q.eq('external_id', externalId);

      const patch = {};
      if (status) patch.status = status === 'PAID' || status === 'SETTLED' || status === 'SUCCESS' ? 'PAID' : status;
      if (invoiceId) patch.invoice_id = invoiceId;
      if (externalId) patch.external_id = externalId;
      if (paidAt) patch.paid_at = paidAt;
      patch.updated_at = new Date().toISOString();

      const { data: txs } = await q.update(patch).select('*');
      if (txs && txs.length) {
        for (const tx of txs) {
          if (patch.status === 'PAID' && tx.kind === 'membership' && tx.ref_id) {
            // Activate membership
            const { data: mem } = await supabase
              .from('user_memberships')
              .select('*, membership_plans(*)')
              .eq('id', tx.ref_id)
              .single();
            if (mem) {
              const start = new Date();
              const days = parseInt(mem.membership_plans?.duration_days || '30', 10) || 30;
              const expires = new Date(start.getTime() + days * 86400000);
              await supabase
                .from('user_memberships')
                .update({ status: 'active', started_at: start.toISOString(), expires_at: expires.toISOString(), updated_at: new Date().toISOString() })
                .eq('id', mem.id);
              // Optionally elevate user role
              const role = mem.membership_plans?.role_granted;
              if (role) {
                await supabase.from('users').update({ role, updated_at: new Date().toISOString() }).eq('id', mem.user_id);
              }
            }
          }
          // Referral commission hook
          if (patch.status === 'PAID') {
            await processPaidTransaction(tx.id);
          } else if (['REFUNDED', 'FAILED', 'EXPIRED'].includes(patch.status || '')) {
            await handleRefundOrFail(tx.id);
          }
        }
      }
    }

    return res.json({ received: true });
  } catch (e) {
    console.error('[Webhook Xendit] failed', e);
    // Always 200 to prevent retries storms; but include message
    return res.status(200).json({ received: false, error: e?.message || 'error' });
  }
});

// ---- SEED data awal ----
app.post('/api/admin/seed', requireAdmin, async (_req, res) => {
  try {
    // users (upsert by email)
    await supabase.from('users').upsert([
      { email: 'admin@stockwise.id', username: 'admin', name: 'Admin', password: await bcrypt.hash('Admin#123', 10), role: 'admin', is_verified: true },
      { email: 'user@stockwise.id', username: 'user', name: 'User', password: await bcrypt.hash('User#123', 10), role: 'guest', is_verified: true },
    ], { onConflict: 'email' });

    // courses
    const { data: course1 } = await supabase.from('courses').insert([{
      title: 'Kelas IPO A-Z',
      description: 'Belajar analisis IPO dari 0.',
      price: 1200000,
      is_published: true,
      min_tier: 'FREE',
    }]).select('*').single();

    // videos
    if (course1?.id) {
      await supabase.from('videos').insert([
        { course_id: course1.id, title: 'Intro', video_url: null, order_index: 1, duration_seconds: 300 },
        { course_id: course1.id, title: 'Menilai Prospektus', video_url: null, order_index: 2, duration_seconds: 900 },
      ]);
    }

    // events
    await supabase.from('events').insert([
      {
        title: 'Stockwise Community Conference',
        description: 'Meetup & sharing session.',
        event_date: new Date(Date.now() + 7 * 86400000).toISOString(), // +7 hari
        price: 5000000,
        location: 'GIOI Pantai Indah Kapuk 2',
        is_online: false,
        event_url: null,
        is_published: true,
      },
      {
        title: 'Webinar: Multibagger 101',
        description: 'Strategi fundamental long-term.',
        event_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        price: 0,
        location: 'Zoom',
        is_online: true,
        event_url: 'https://zoom.us/j/xxxx',
        is_published: true,
      }
    ]);

    return ok(res, { message: 'Seed inserted' });
  } catch (err) {
    console.error(err);
    return fail(res, err.message);
  }
});

// Health
app.get('/api/health', (_req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import verifyRoute from './routes/verify';
import ageGateRoute from './routes/age-gate';

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
}));

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json());

// ── Rate limiter ──────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Limit: 30/min per IP.' },
});
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/verify', verifyRoute);
app.use('/api/age-gate', ageGateRoute);

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ── 404 handler ──────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ─────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 IDVerify API running on http://localhost:${PORT}`);
  console.log(`📋 POST /api/verify    - Upload ID image`);
  console.log(`📋 POST /api/age-gate  - Check age only`);
  console.log(`📋 GET  /api/health    - Health check\n`);
});

export default app;
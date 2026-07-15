import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import prisma from './config/database';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import notificationRoutes from './routes/notification.routes';
import employeeRoutes from './routes/employee.routes';
import settingsRoutes from './routes/settings.routes';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Trust proxy (Railway, Vercel, etc.)
app.set('trust proxy', 1);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware
app.use(helmet());

const toOrigin = (value?: string) => {
  if (!value) return null;
  return value.startsWith('http://') || value.startsWith('https://')
    ? value.replace(/\/$/, '')
    : `https://${value.replace(/\/$/, '')}`;
};

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  toOrigin(process.env.APP_URL),
  toOrigin(process.env.CORS_ORIGIN),
  toOrigin(process.env.VERCEL_URL),
  toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
].filter((origin): origin is string => Boolean(origin)));

app.use(cors({
  origin: (origin, callback) => {
    // Requests without Origin include server-to-server and same-origin navigation.
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    return callback(new Error('Origin tidak diizinkan oleh CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Terlalu banyak percobaan' },
  standardHeaders: true,
  legacyHeaders: false
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave-request', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/settings', settingsRoutes);

// API fallback. Frontend routing/static assets are handled by Vercel's CDN.
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use(errorHandler);

export default app;

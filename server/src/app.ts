import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
// CORS: support multiple origins (local dev + Vercel production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Also allow any Vercel preview deployment
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak percobaan, coba lagi dalam 5 menit'
  },
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

// Error handler
app.use(errorHandler);

// Auto-migrate database on startup (production)
if (process.env.VERCEL !== '1') {
  try {
    console.log('Running database migration...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('Database migration completed.');
  } catch (err) {
    console.error('Database migration failed:', err);
  }
}

// Only start server in non-Vercel environments (local dev, Docker)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

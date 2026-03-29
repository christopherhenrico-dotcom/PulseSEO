import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth';
import auditRoutes from './routes/audits';
import clientRoutes from './routes/clients';
import billingRoutes from './routes/billing';
import teamRoutes from './routes/team';
import reportsRoutes from './routes/reports';
import settingsRoutes from './routes/settings';
import analyticsRoutes from './routes/analytics';
import scheduledRoutes from './routes/scheduled';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scheduled', scheduledRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'PulseSEO API',
    version: '1.0.0',
    documentation: 'https://docs.pulseseo.com',
    endpoints: {
      auth: '/api/auth',
      audits: '/api/audits',
      clients: '/api/clients',
      billing: '/api/billing',
      team: '/api/team',
      reports: '/api/reports',
      settings: '/api/settings',
      analytics: '/api/analytics',
      scheduled: '/api/scheduled'
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  logger.info(`PulseSEO API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

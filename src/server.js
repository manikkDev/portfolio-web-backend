import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import logger from './utils/logger.js';

const app = express();

// ─── Global Middleware ───────────────────────────────────────
app.use(cors({
  origin: env.frontendUrl,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

app.use(express.json({ limit: '10kb' }));
app.use(generalLimiter);

// Request logger (development)
if (env.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });
}

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Endpoint not found' },
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
app.listen(env.port, () => {
  logger.info(`🚀 Portfolio API running on http://localhost:${env.port}`);
  logger.info(`   Environment: ${env.nodeEnv}`);
  logger.info(`   CORS origin: ${env.frontendUrl}`);
});

export default app;

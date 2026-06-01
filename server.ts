import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer as createViteServer } from 'vite';

import { config } from './src/config/index';
import router from './src/routes/api';
import { errorHandler } from './src/middleware/error';
import { queueManager } from './src/services/queue';
import { getDb } from './src/services/db';

async function startServer() {
  if (!config.jwtSecret || !config.jwtRefreshSecret) {
    throw new Error('Missing JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET in your env file.');
  }

  const app = express();
  const PORT = config.port;

  // 1. Enable standard security header modifications
  app.use(helmet({
    contentSecurityPolicy: false, // Permits iframe execution inside the AI Studio preview
    crossOriginEmbedderPolicy: false
  }));

  // CORS matching workspace criteria
  app.use(cors());

  // JSON parses
  app.use(express.json());

  // standard logger morgan
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

  // 2. Health, Readiness, and Prometheus System Metrics tracker
  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      const db = getDb();
      await db.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'UP',
        database: 'CONNECTED',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: err.message
      });
    }
  });

  app.get('/api/ready', (req: Request, res: Response) => {
    res.status(200).json({ status: 'READY', uptime: process.uptime() });
  });

  app.get('/api/metrics', async (req: Request, res: Response) => {
    try {
      const db = getDb();
      const memoryUsage = process.memoryUsage();
      const [totalUsers, activeJobs, failedJobs, totalKeys] = await Promise.all([
        db.user.count(),
        db.job.count({ where: { status: 'running' } }),
        db.job.count({ where: { status: 'failed' } }),
        db.apiKey.count()
      ]);

      res.status(200).json({
        uptime_seconds: process.uptime(),
        memory_usage_bytes: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external
        },
        monitoring_metrics: {
          registered_users: totalUsers,
          active_running_threads: activeJobs,
          failed_spider_threads: failedJobs,
          issued_api_keys: totalKeys
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to extract metrics', details: err.message });
    }
  });

  // 3. API Sub-router wiring
  app.use('/api', router);

  // 4. Global Unified error logger/manager
  app.use(errorHandler);

  // 5. Start queue workers
  queueManager.startWorker();

  // 6. Integrate SPA Vite Dev & Build fallback layer
  if (process.env.NODE_ENV !== 'production') {
    console.log('Injecting Vite dev environment middleware layers.');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static build layouts.');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 7. Launch App Context listening
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` SOCIAL DATA SCRAPER SERVICE DEPLOYED SUCCESSFULLY  `);
    console.log(` Port: ${PORT} | Mode: ${config.nodeEnv}             `);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal crash during app compilation initialization:', err);
});

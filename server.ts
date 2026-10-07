import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.routes.ts';
import userRoutes from './server/routes/user.routes.ts';
import serviceRoutes from './server/routes/service.routes.ts';
import projectRoutes from './server/routes/project.routes.ts';
import proposalRoutes from './server/routes/proposal.routes.ts';
import exchangeRoutes from './server/routes/exchange.routes.ts';
import workspaceRoutes from './server/routes/workspace.routes.ts';
import paymentRoutes from './server/routes/payment.routes.ts';
import reviewRoutes from './server/routes/review.routes.ts';
import notificationRoutes from './server/routes/notification.routes.ts';
import wishlistRoutes from './server/routes/wishlist.routes.ts';
import reportRoutes from './server/routes/report.routes.ts';
import adminRoutes from './server/routes/admin.routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/proposals', proposalRoutes);
  app.use('/api/exchange', exchangeRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'TalentTrade API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Vite middleware in dev or static files in prod
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TalentTrade server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

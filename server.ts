import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import healthHandler from './api/health.ts';
import psiHandler from './api/psi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');

  // Serverless-compatible API routes mounted at /api/*
  app.all('/api/health', (req, res) => {
    healthHandler(req, res);
  });

  app.all('/api/psi', (req, res, next) => {
    Promise.resolve(psiHandler(req, res)).catch(next);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SG Airwatch server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start SG Airwatch server:', error);
  process.exit(1);
});

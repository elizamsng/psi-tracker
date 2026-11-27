import type { IncomingMessage, ServerResponse } from 'node:http';

interface ServerlessRequest extends IncomingMessage {
  query?: Record<string, unknown>;
}

interface ServerlessResponse extends ServerResponse {
  status?: (code: number) => ServerlessResponse;
  json?: (body: unknown) => unknown;
}

function sendJson(res: ServerlessResponse, statusCode: number, payload: unknown): void {
  if (typeof res.status === 'function') {
    const chain = res.status(statusCode);
    if (typeof chain.json === 'function') {
      chain.json(payload);
      return;
    }
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export default function handler(req: ServerlessRequest, res: ServerlessResponse): void {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendJson(res, 405, {
      status: 'error',
      message: 'Method not allowed. Use GET.',
    });
    return;
  }

  if (req.method === 'HEAD') {
    res.statusCode = 200;
    res.end();
    return;
  }

  sendJson(res, 200, {
    status: 'ok',
    service: 'sg-airwatch-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
}

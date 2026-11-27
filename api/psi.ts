import type { IncomingMessage, ServerResponse } from 'node:http';

const NEA_PSI_V2_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const NEA_PM25_V2_URL = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';
const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface ServerlessRequest extends IncomingMessage {
  query?: Record<string, unknown>;
}

interface ServerlessResponse extends ServerResponse {
  status?: (code: number) => ServerlessResponse;
  json?: (body: unknown) => unknown;
}

interface DataGovV2Response {
  code: number;
  errorMsg?: string;
  data?: {
    regionMetadata?: Array<{
      name: string;
      labelLocation: {
        latitude: number;
        longitude: number;
      };
    }>;
    items?: Array<{
      date?: string;
      timestamp: string;
      updatedTimestamp?: string;
      updateTimestamp?: string;
      readings: Record<string, Record<string, number>>;
    }>;
    paginationToken?: string;
  };
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

function extractDateParam(req: ServerlessRequest): string | null {
  let rawDate: string | undefined;

  if (req.query && typeof req.query.date === 'string') {
    rawDate = req.query.date;
  } else if (req.url) {
    const parsedUrl = new URL(req.url, 'http://localhost');
    rawDate = parsedUrl.searchParams.get('date') ?? undefined;
  }

  if (!rawDate) return null;
  if (!DATE_PARAM_REGEX.test(rawDate)) {
    throw new Error('INVALID_DATE_FORMAT');
  }
  return rawDate;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, {
      code: 405,
      errorMsg: 'Method not allowed. Use GET.',
    });
    return;
  }

  let dateFilter: string | null = null;
  try {
    dateFilter = extractDateParam(req);
  } catch {
    sendJson(res, 400, {
      code: 400,
      errorMsg: 'Invalid date parameter. Expected YYYY-MM-DD.',
    });
    return;
  }

  const psiUrl = new URL(NEA_PSI_V2_URL);
  const pm25Url = new URL(NEA_PM25_V2_URL);
  if (dateFilter) {
    psiUrl.searchParams.set('date', dateFilter);
    pm25Url.searchParams.set('date', dateFilter);
  }

  try {
    const [psiResult, pm25Result] = await Promise.allSettled([
      fetch(psiUrl.toString(), {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(pm25Url.toString(), {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    if (psiResult.status === 'rejected') {
      sendJson(res, 504, {
        code: 504,
        errorMsg: 'Timed out or failed reaching NEA PSI service.',
      });
      return;
    }

    const psiResponse = psiResult.value;
    if (!psiResponse.ok) {
      sendJson(res, 502, {
        code: psiResponse.status,
        errorMsg: `Upstream NEA PSI service returned HTTP ${psiResponse.status}.`,
      });
      return;
    }

    const psiPayload = (await psiResponse.json()) as DataGovV2Response;

    if (psiPayload.code !== 0 || !psiPayload.data?.items?.length) {
      sendJson(res, 502, {
        code: psiPayload.code ?? 502,
        errorMsg: psiPayload.errorMsg || 'Upstream NEA PSI payload contained no items.',
      });
      return;
    }

    // Merge 1-hr PM2.5 readings when available from companion NEA v2 endpoint
    if (pm25Result.status === 'fulfilled' && pm25Result.value.ok) {
      try {
        const pm25Payload = (await pm25Result.value.json()) as DataGovV2Response;
        const pm25Hourly = pm25Payload.data?.items?.[0]?.readings?.pm25_one_hourly;
        if (pm25Hourly && psiPayload.data.items[0]?.readings) {
          psiPayload.data.items[0].readings.pm25_one_hourly = pm25Hourly;
        }
      } catch {
        // Non-critical enrichment: continue returning primary PSI data
      }
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    sendJson(res, 200, psiPayload);
  } catch {
    sendJson(res, 502, {
      code: 502,
      errorMsg: 'Unable to retrieve PSI telemetry from upstream service.',
    });
  }
}

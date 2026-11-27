import React, { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import type { PsiSnapshot } from '../types/psi';
import {
  LIVE_NEA_PSI_ENDPOINT,
  SERVERLESS_PSI_ROUTE,
  toNeaApiPayload,
} from '../services/psiService';

interface ApiSchemaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PsiSnapshot;
}

const SERVERLESS_ROUTES_INFO = `GET /api/health  -> Health status & uptime check (/api/health.ts)
GET /api/psi     -> Proxies ${LIVE_NEA_PSI_ENDPOINT} (/api/psi.ts)`;

export const ApiSchemaDrawer: React.FC<ApiSchemaDrawerProps> = ({
  isOpen,
  onClose,
  snapshot,
}) => {
  const [copiedTab, setCopiedTab] = useState<'routes' | 'payload' | null>(null);

  if (!isOpen) return null;

  const sampleJson = JSON.stringify(toNeaApiPayload(snapshot), null, 2);

  const handleCopy = async (text: string, which: 'routes' | 'payload') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(which);
      setTimeout(() => setCopiedTab(null), 1800);
    } catch {
      // Clipboard fallback ignored cleanly in restricted frames
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-[2px]"
    >
      <div className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F141D]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2
              id="api-drawer-title"
              className="font-display text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              Serverless Connection &amp; NEA v2 Schema
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Connected to {SERVERLESS_PSI_ROUTE} backed by NEA Real-Time PSI v2
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API Schema Drawer"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Upstream NEA Endpoint
            </div>
            <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-[#0B0E14] dark:text-sky-400 break-all">
              GET {LIVE_NEA_PSI_ENDPOINT}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Requests are handled server-side through{' '}
              <code className="font-mono text-slate-900 dark:text-slate-100">/api/psi.ts</code>{' '}
              with 60-second edge cache headers and companion 1-hr PM2.5 enrichment. Health
              probes are served at{' '}
              <code className="font-mono text-slate-900 dark:text-slate-100">/api/health.ts</code>.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Mounted Serverless Routes
              </span>
              <button
                type="button"
                onClick={() => handleCopy(SERVERLESS_ROUTES_INFO, 'routes')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400 cursor-pointer"
              >
                {copiedTab === 'routes' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy routes</span>
                  </>
                )}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200 dark:border-slate-800">
              {SERVERLESS_ROUTES_INFO}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Active Snapshot as NEA v2 JSON
              </span>
              <button
                type="button"
                onClick={() => handleCopy(sampleJson, 'payload')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400 cursor-pointer"
              >
                {copiedTab === 'payload' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300 dark:border-slate-800">
              {sampleJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

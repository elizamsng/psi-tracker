import React, { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import type { PsiSnapshot } from '../types/psi';
import { LIVE_NEA_PSI_ENDPOINT, toNeaApiPayload } from '../services/psiService';

interface ApiSchemaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PsiSnapshot;
}

const ADAPTER_SNIPPET = `// src/services/psiService.ts
export async function fetchLiveNeaPsi(): Promise<PsiSnapshot> {
  const response = await fetch('${LIVE_NEA_PSI_ENDPOINT}');
  if (!response.ok) {
    throw new Error(\`NEA PSI fetch failed: \${response.status}\`);
  }
  const payload: NEAPsiApiResponse = await response.json();
  return transformNeaApiResponse(payload);
}`;

export const ApiSchemaDrawer: React.FC<ApiSchemaDrawerProps> = ({
  isOpen,
  onClose,
  snapshot,
}) => {
  const [copiedTab, setCopiedTab] = useState<'snippet' | 'payload' | null>(null);

  if (!isOpen) return null;

  const sampleJson = JSON.stringify(toNeaApiPayload(snapshot), null, 2);

  const handleCopy = async (text: string, which: 'snippet' | 'payload') => {
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
              NEA Data.gov.sg API Contract
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Frontend models and transformers match the official Singapore PSI endpoint
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
              Target Endpoint
            </div>
            <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-[#0B0E14] dark:text-sky-400 break-all">
              GET {LIVE_NEA_PSI_ENDPOINT}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              The UI currently runs on local scenario datasets. When you are ready to wire the
              live connection, replace the preview branch inside{' '}
              <code className="font-mono text-slate-900 dark:text-slate-100">
                fetchPsiSnapshot
              </code>{' '}
              in{' '}
              <code className="font-mono text-slate-900 dark:text-slate-100">
                src/services/psiService.ts
              </code>{' '}
              with the adapter below.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Live Fetch Adapter
              </span>
              <button
                type="button"
                onClick={() => handleCopy(ADAPTER_SNIPPET, 'snippet')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400 cursor-pointer"
              >
                {copiedTab === 'snippet' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy snippet</span>
                  </>
                )}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200 dark:border-slate-800">
              {ADAPTER_SNIPPET}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Current Snapshot Serialized as NEA JSON
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

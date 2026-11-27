import React from 'react';
import { Download, Moon, RefreshCw, Sun } from 'lucide-react';
import type { ScenarioId } from '../types/psi';
import { SCENARIO_OPTIONS } from '../services/psiService';

interface WorkspaceToolbarProps {
  scenarioId: ScenarioId;
  onScenarioChange: (scenario: ScenarioId) => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  isRefreshing: boolean;
  updatedAtSgt: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  scenarioId,
  onScenarioChange,
  onRefresh,
  onExportCsv,
  isRefreshing,
  updatedAtSgt,
  isDark,
  onToggleTheme,
}) => {
  return (
    <div className="border-b border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-[#0B0E14]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Preview Scenario
          </span>
          <div
            role="group"
            aria-label="Atmospheric Scenario"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-[#111722]"
          >
            {SCENARIO_OPTIONS.map((opt) => {
              const active = opt.id === scenarioId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onScenarioChange(opt.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600 ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            NEA Standard · {updatedAtSgt}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60 dark:border-slate-800 dark:bg-[#111722] dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating' : 'Simulate Tick'}</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-[#111722] dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-[#111722] dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { RegionalReading, RegionId } from '../types/psi';
import { REGION_ORDER } from '../services/psiService';
import { getPm25HourlyBand, getPsiBand } from '../utils/psiBands';

interface StationSidebarProps {
  regions: Record<RegionId, RegionalReading>;
  selectedRegionId: RegionId;
  onSelectRegion: (id: RegionId) => void;
}

export const StationSidebar: React.FC<StationSidebarProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
}) => {
  const [query, setQuery] = useState('');

  const orderedIds: RegionId[] = ['national', ...REGION_ORDER];

  const filteredIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orderedIds;
    return orderedIds.filter((id) => {
      const reg = regions[id];
      return (
        reg.name.toLowerCase().includes(q) ||
        reg.towns.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, regions]);

  return (
    <aside className="flex flex-col border border-slate-200 bg-white rounded-xl dark:border-slate-800 dark:bg-[#111722]">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            Regional Stations
          </h2>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            5 NEA Zones
          </span>
        </div>

        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by town or region (e.g. Tampines)"
            aria-label="Filter Singapore regions by town or zone"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-[#0B0E14] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {filteredIds.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No Singapore monitoring zone matches "{query}".
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-2 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400 cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        ) : (
          filteredIds.map((id) => {
            const reg = regions[id];
            const band = getPsiBand(reg.metrics.psi_twenty_four_hourly);
            const pm25Band = getPm25HourlyBand(reg.metrics.pm25_one_hourly);
            const isSelected = selectedRegionId === id;
            const deltaPrefix = reg.delta1h > 0 ? '+' : '';

            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectRegion(id)}
                aria-pressed={isSelected}
                className={`w-full px-4 py-3.5 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-sky-600 ${
                  isSelected
                    ? 'bg-sky-50/75 dark:bg-sky-950/35'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {reg.name}
                      </span>
                      {isSelected && (
                        <span className="font-mono text-[11px] font-medium text-sky-700 dark:text-sky-400">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {reg.towns.slice(0, 3).join(' · ')}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xl font-semibold leading-none text-slate-900 dark:text-slate-100">
                      {reg.metrics.psi_twenty_four_hourly}
                    </div>
                    <div className={`mt-1 text-[11px] font-medium ${band.textClass}`}>
                      <span aria-hidden="true">{band.glyph}</span> {band.label}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>
                    1h PM2.5:{' '}
                    <strong className={`font-medium ${pm25Band.textClass}`}>
                      {reg.metrics.pm25_one_hourly} µg/m³
                    </strong>
                  </span>
                  <span>
                    1h Δ:{' '}
                    <span
                      className={
                        reg.delta1h > 0
                          ? 'text-amber-700 dark:text-amber-400'
                          : reg.delta1h < 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : ''
                      }
                    >
                      {deltaPrefix}
                      {reg.delta1h}
                    </span>
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

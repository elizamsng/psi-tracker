import React, { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { PollutantMetrics, RegionalReading, RegionId } from '../types/psi';
import { REGION_ORDER } from '../services/psiService';
import { getPsiBand } from '../utils/psiBands';

interface PollutantMatrixProps {
  regions: Record<RegionId, RegionalReading>;
  selectedRegionId: RegionId;
  onSelectRegion: (id: RegionId) => void;
}

type SortKey = keyof PollutantMetrics | 'name';

const COLUMNS: Array<{ key: keyof PollutantMetrics; label: string; unit: string }> = [
  { key: 'psi_twenty_four_hourly', label: '24h PSI', unit: 'idx' },
  { key: 'pm25_one_hourly', label: '1h PM2.5', unit: 'µg/m³' },
  { key: 'pm25_twenty_four_hourly', label: '24h PM2.5', unit: 'µg/m³' },
  { key: 'pm10_twenty_four_hourly', label: '24h PM10', unit: 'µg/m³' },
  { key: 'o3_sub_index', label: 'O₃', unit: 'sub' },
  { key: 'co_sub_index', label: 'CO', unit: 'sub' },
  { key: 'so2_sub_index', label: 'SO₂', unit: 'sub' },
  { key: 'no2_one_hour_max', label: 'NO₂ 1h', unit: 'µg/m³' },
];

export const PollutantMatrix: React.FC<PollutantMatrixProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('psi_twenty_four_hourly');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedRegionalRows = useMemo(() => {
    const list = REGION_ORDER.map((id) => regions[id]);
    return [...list].sort((a, b) => {
      if (sortKey === 'name') {
        return sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      const diff = a.metrics[sortKey] - b.metrics[sortKey];
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [regions, sortKey, sortDir]);

  const rowsToRender = [regions.national, ...sortedRegionalRows];

  return (
    <section className="border border-slate-200 bg-white rounded-xl dark:border-slate-800 dark:bg-[#111722]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Pollutant Sub-Index Matrix
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Click column headers to sort regions or select any row to focus inspection
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          6 Regulated Pollutants
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[740px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-[#0B0E14] dark:text-slate-400">
              <th className="px-5 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                >
                  <span>Region</span>
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </button>
              </th>
              <th className="px-3 py-3 font-medium">Air Quality</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center justify-end gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    <span>{col.label}</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </button>
                  <div className="font-mono text-[10px] font-normal text-slate-400">
                    {col.unit}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {rowsToRender.map((row) => {
              const band = getPsiBand(row.metrics.psi_twenty_four_hourly);
              const isSelected = selectedRegionId === row.id;
              const isNational = row.id === 'national';

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectRegion(row.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/70 dark:bg-sky-950/35'
                      : isNational
                        ? 'bg-slate-50/40 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-800/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="font-display font-semibold text-slate-900 dark:text-slate-100">
                      {row.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {row.towns.slice(0, 2).join(', ')}
                    </div>
                  </td>

                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`font-medium ${band.textClass}`}>
                      <span aria-hidden="true">{band.glyph}</span> {band.label}
                    </span>
                  </td>

                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-3 text-right font-mono text-xs ${
                        col.key === 'psi_twenty_four_hourly'
                          ? 'font-semibold text-slate-900 dark:text-slate-100'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {row.metrics[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

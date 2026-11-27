import React, { useMemo, useState } from 'react';
import type { RegionalReading, RegionId, SpatialRegionId } from '../types/psi';
import { REGION_ORDER } from '../services/psiService';

interface TrendChartProps {
  regions: Record<RegionId, RegionalReading>;
  selectedRegionId: RegionId;
}

const REGION_LINE_COLORS: Record<SpatialRegionId, string> = {
  north: '#0284C7',
  central: '#0F172A',
  east: '#16A34A',
  west: '#D97706',
  south: '#7C3AED',
};

export const TrendChart: React.FC<TrendChartProps> = ({ regions, selectedRegionId }) => {
  const [mode, setMode] = useState<'focused' | 'all'>('focused');
  const [metric, setMetric] = useState<'psi' | 'pm25Hourly'>('psi');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 760;
  const height = 250;
  const padLeft = 44;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const visibleIds: RegionId[] = useMemo(() => {
    if (mode === 'all') return REGION_ORDER;
    if (selectedRegionId === 'national') return ['national'];
    return [selectedRegionId, 'national'];
  }, [mode, selectedRegionId]);

  const seriesLength = regions.national.hourlyTrend.length;

  const yMax = useMemo(() => {
    let maxVal = 60;
    for (const id of REGION_ORDER) {
      for (const pt of regions[id].hourlyTrend) {
        if (pt[metric] > maxVal) maxVal = pt[metric];
      }
    }
    return Math.ceil((maxVal + 15) / 25) * 25;
  }, [regions, metric]);

  const xForIndex = (idx: number) =>
    padLeft + (idx / Math.max(1, seriesLength - 1)) * plotW;

  const yForValue = (val: number) =>
    padTop + plotH - (Math.min(yMax, Math.max(0, val)) / yMax) * plotH;

  const buildPolyline = (id: RegionId) =>
    regions[id].hourlyTrend
      .map((pt, idx) => `${xForIndex(idx).toFixed(1)},${yForValue(pt[metric]).toFixed(1)}`)
      .join(' ');

  const thresholds =
    metric === 'psi'
      ? [
          { val: 50, label: '50 Good', color: '#16A34A' },
          { val: 100, label: '100 Moderate', color: '#D97706' },
          { val: 200, label: '200 Unhealthy', color: '#DC2626' },
        ].filter((t) => t.val <= yMax)
      : [
          { val: 55, label: '55 Normal', color: '#16A34A' },
          { val: 150, label: '150 Elevated', color: '#D97706' },
        ].filter((t) => t.val <= yMax);

  const activeIdx = hoverIdx ?? seriesLength - 1;
  const activeHourLabel = regions.national.hourlyTrend[activeIdx]?.hourLabel ?? '';

  return (
    <section
      id="trends"
      className="border border-slate-200 bg-white rounded-xl p-5 dark:border-slate-800 dark:bg-[#111722]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            24-Hour Atmospheric Trajectory
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Hourly rolling progression across Singapore stations (SGT)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Chart Metric"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-[#0B0E14]"
          >
            <button
              type="button"
              onClick={() => setMetric('psi')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metric === 'psi'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              24-hr PSI
            </button>
            <button
              type="button"
              onClick={() => setMetric('pm25Hourly')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metric === 'pm25Hourly'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              1-hr PM2.5
            </button>
          </div>

          <div
            role="group"
            aria-label="Chart Series Comparison"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-[#0B0E14]"
          >
            <button
              type="button"
              onClick={() => setMode('focused')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'focused'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Selected vs National
            </button>
            <button
              type="button"
              onClick={() => setMode('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              All 5 Regions
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Hour Readout Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-2.5 text-xs dark:border-slate-800/80">
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
          {hoverIdx === null ? 'Latest Hour' : 'Inspecting'}: {activeHourLabel} SGT
        </span>
        <div className="flex flex-wrap items-center gap-4 font-mono">
          {visibleIds.map((id) => {
            const val = regions[id].hourlyTrend[activeIdx]?.[metric] ?? 0;
            const color =
              id === 'national'
                ? '#64748B'
                : REGION_LINE_COLORS[id as SpatialRegionId];
            return (
              <span key={id} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-xs"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="text-slate-600 dark:text-slate-400">
                  {id === 'national' ? 'National' : regions[id].name}:
                </span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {val} {metric === 'pm25Hourly' ? 'µg/m³' : ''}
                </strong>
              </span>
            );
          })}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="mt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full select-none cursor-crosshair"
          role="img"
          aria-label="24-hour regional air quality line chart"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const clamped = Math.max(padLeft, Math.min(width - padRight, relX));
            const ratio = (clamped - padLeft) / plotW;
            const idx = Math.round(ratio * (seriesLength - 1));
            setHoverIdx(idx);
          }}
        >
          {/* Y-axis Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const val = Math.round(yMax * t);
            const y = yForValue(val);
            return (
              <g key={t}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-100 dark:text-slate-800/80"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px]"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* NEA Band Threshold Reference Lines */}
          {thresholds.map((t) => {
            const y = yForValue(t.val);
            return (
              <g key={t.label}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={t.color}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
                <text
                  x={width - padRight - 4}
                  y={y - 4}
                  textAnchor="end"
                  fill={t.color}
                  className="font-mono text-[10px] font-medium"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* X-axis Hour Labels */}
          {[0, 4, 8, 12, 16, 20, 23].map((idx) => {
            const pt = regions.national.hourlyTrend[idx];
            if (!pt) return null;
            return (
              <text
                key={idx}
                x={xForIndex(idx)}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px]"
              >
                {pt.hourLabel}
              </text>
            );
          })}

          {/* Series Lines */}
          {visibleIds.map((id) => {
            const isNational = id === 'national';
            const strokeColor = isNational
              ? '#64748B'
              : REGION_LINE_COLORS[id as SpatialRegionId];
            return (
              <polyline
                key={id}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isNational && mode === 'focused' ? 1.75 : 2.25}
                strokeDasharray={isNational && mode === 'focused' ? '5 4' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={buildPolyline(id)}
              />
            );
          })}

          {/* Interactive Vertical Crosshair */}
          <line
            x1={xForIndex(activeIdx)}
            y1={padTop}
            x2={xForIndex(activeIdx)}
            y2={padTop + plotH}
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-400 dark:text-slate-500"
          />

          {/* Data Point Markers at Crosshair */}
          {visibleIds.map((id) => {
            const pt = regions[id].hourlyTrend[activeIdx];
            if (!pt) return null;
            const color =
              id === 'national'
                ? '#64748B'
                : REGION_LINE_COLORS[id as SpatialRegionId];
            return (
              <circle
                key={id}
                cx={xForIndex(activeIdx)}
                cy={yForValue(pt[metric])}
                r="4"
                fill={color}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
};

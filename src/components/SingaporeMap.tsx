import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import type {
  MetricLayer,
  RegionalReading,
  RegionId,
  SpatialRegionId,
  WindTelemetry,
} from '../types/psi';
import { REGION_ORDER } from '../services/psiService';
import { getPm25HourlyBand, getPsiBand, METRIC_LAYERS } from '../utils/psiBands';

interface SingaporeMapProps {
  regions: Record<RegionId, RegionalReading>;
  selectedRegionId: RegionId;
  onSelectRegion: (id: RegionId) => void;
  activeLayer: MetricLayer;
  onChangeLayer: (layer: MetricLayer) => void;
  wind: WindTelemetry;
}

function getLayerDisplay(reading: RegionalReading, layer: MetricLayer) {
  const value = reading.metrics[layer];
  if (layer === 'pm25_one_hourly') {
    const band = getPm25HourlyBand(value);
    return {
      value,
      unit: 'µg/m³',
      label: band.label,
      glyph: band.glyph,
      accentHex:
        value <= 55 ? '#16A34A' : value <= 150 ? '#D97706' : value <= 250 ? '#DC2626' : '#991B1B',
      ringFillHex:
        value <= 55
          ? 'rgba(22, 163, 74, 0.16)'
          : value <= 150
            ? 'rgba(217, 119, 6, 0.20)'
            : 'rgba(220, 38, 38, 0.22)',
    };
  }

  const band = getPsiBand(
    layer === 'psi_twenty_four_hourly' ? value : reading.metrics.psi_twenty_four_hourly
  );
  const layerMeta = METRIC_LAYERS.find((m) => m.id === layer);
  return {
    value,
    unit: layerMeta?.unit ?? '',
    label: layer === 'psi_twenty_four_hourly' ? band.label : layerMeta?.shortLabel ?? '',
    glyph: band.glyph,
    accentHex: band.accentHex,
    ringFillHex: band.ringFillHex,
  };
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  activeLayer,
  onChangeLayer,
  wind,
}) => {
  const [hoveredId, setHoveredId] = useState<SpatialRegionId | null>(null);

  const activeLayerMeta = METRIC_LAYERS.find((l) => l.id === activeLayer) ?? METRIC_LAYERS[0];
  const inspectedId: SpatialRegionId =
    hoveredId ?? (selectedRegionId === 'national' ? 'central' : selectedRegionId);
  const inspectedRegion = regions[inspectedId];
  const inspectedDisplay = getLayerDisplay(inspectedRegion, activeLayer);

  return (
    <section
      id="regional-map"
      className="flex flex-col border border-slate-200 bg-white rounded-xl dark:border-slate-800 dark:bg-[#111722]"
    >
      {/* Map Header & Layer Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Singapore Regional Dispersion Map
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {activeLayerMeta.description}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Map Pollutant Layer"
          className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-[#0B0E14]"
        >
          {METRIC_LAYERS.map((layer) => {
            const active = layer.id === activeLayer;
            return (
              <button
                key={layer.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeLayer(layer.id)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Map Viewport */}
      <div className="relative p-4 sm:p-5">
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-[#F4F7FA] dark:border-slate-800 dark:bg-[#0A0F18]">
          {/* Top-left Wind Telemetry HUD */}
          <div className="pointer-events-none absolute left-3.5 top-3.5 z-10 flex items-center gap-2.5 rounded-md border border-slate-200/90 bg-white/90 px-3 py-2 backdrop-blur-xs dark:border-slate-700/80 dark:bg-[#111722]/90">
            <Compass
              className="h-4 w-4 text-sky-600 dark:text-sky-400"
              style={{ transform: `rotate(${wind.bearingDegrees}deg)` }}
              aria-hidden="true"
            />
            <div className="font-mono text-[11px] leading-tight">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Wind {wind.directionLabel} · {wind.speedKmh} km/h
              </div>
              <div className="text-slate-500 dark:text-slate-400">{wind.monsoonPhase}</div>
            </div>
          </div>

          {/* Top-right Crosshair Probe HUD */}
          <div className="pointer-events-none absolute right-3.5 top-3.5 z-10 hidden sm:block rounded-md border border-slate-200/90 bg-white/90 px-3 py-2 text-right backdrop-blur-xs dark:border-slate-700/80 dark:bg-[#111722]/90">
            <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {inspectedRegion.name} Zone · {inspectedRegion.latitude.toFixed(3)}°N,{' '}
              {inspectedRegion.longitude.toFixed(3)}°E
            </div>
            <div className="mt-0.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
              {activeLayerMeta.shortLabel}: {inspectedDisplay.value} {inspectedDisplay.unit} (
              {inspectedDisplay.label})
            </div>
          </div>

          <svg
            viewBox="0 0 800 440"
            role="img"
            aria-label="Interactive regional air quality map of Singapore"
            className="h-auto w-full select-none cursor-crosshair"
          >
            <defs>
              <pattern id="sg-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  className="text-slate-300/60 dark:text-slate-800/70"
                />
              </pattern>
            </defs>

            {/* Coordinate Graticule Background */}
            <rect width="800" height="440" fill="url(#sg-grid)" />

            {/* Latitude / Longitude Margin Labels */}
            <g className="fill-slate-400 dark:fill-slate-600 font-mono text-[10px]">
              <text x="14" y="54">1.46°N</text>
              <text x="14" y="218">1.35°N</text>
              <text x="14" y="384">1.24°N</text>
              <text x="120" y="426">103.65°E</text>
              <text x="392" y="426">103.82°E</text>
              <text x="645" y="426">104.00°E</text>
            </g>

            {/* Johor Strait & Singapore Strait Sea Labels */}
            <text
              x="258"
              y="78"
              className="fill-slate-400/80 dark:fill-slate-600 font-mono text-[10px] tracking-widest"
            >
              STRAIT OF JOHOR
            </text>
            <text
              x="470"
              y="386"
              className="fill-slate-400/80 dark:fill-slate-600 font-mono text-[10px] tracking-widest"
            >
              SINGAPORE STRAIT
            </text>

            {/* Causeway (Woodlands) & Tuas Second Link */}
            <line
              x1="330"
              y1="62"
              x2="335"
              y2="92"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="3 2"
              className="text-slate-400 dark:text-slate-600"
            />
            <line
              x1="104"
              y1="226"
              x2="132"
              y2="236"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="3 2"
              className="text-slate-400 dark:text-slate-600"
            />

            {/* Singapore Main Island Polygon */}
            <path
              d="M 118 258
                 L 106 232 L 116 202 L 145 178 L 175 152 L 210 134 L 246 112
                 L 285 96 L 332 88 L 368 92 L 408 86 L 444 96 L 486 116
                 L 522 132 L 560 136 L 605 144 L 648 156 L 686 172 L 712 184
                 L 702 214 L 682 232 L 642 246 L 594 256 L 542 268 L 494 282
                 L 462 296 L 434 316 L 398 320 L 362 316 L 326 306 L 288 294
                 L 246 286 L 204 282 L 164 286 L 132 276 Z"
              className="fill-white stroke-slate-300 dark:fill-[#161F2E] dark:stroke-slate-700"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Jurong Island */}
            <path
              d="M 176 312 L 222 302 L 246 316 L 226 336 L 184 334 Z"
              className="fill-white stroke-slate-300 dark:fill-[#161F2E] dark:stroke-slate-700"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Sentosa Island */}
            <path
              d="M 378 334 L 414 332 L 424 344 L 388 348 Z"
              className="fill-white stroke-slate-300 dark:fill-[#161F2E] dark:stroke-slate-700"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Pulau Ubin */}
            <path
              d="M 594 114 L 636 112 L 648 124 L 616 130 L 592 124 Z"
              className="fill-white stroke-slate-300 dark:fill-[#161F2E] dark:stroke-slate-700"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Pulau Tekong */}
            <path
              d="M 664 106 L 708 102 L 722 128 L 694 146 L 664 134 Z"
              className="fill-white stroke-slate-300 dark:fill-[#161F2E] dark:stroke-slate-700"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Subtle Regional Zone Dividers */}
            <g
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="text-slate-200 dark:text-slate-700/70"
            >
              <line x1="298" y1="98" x2="322" y2="294" />
              <line x1="510" y1="130" x2="500" y2="278" />
              <line x1="312" y1="162" x2="508" y2="162" />
              <line x1="318" y1="266" x2="500" y2="266" />
            </g>

            {/* Wind Drift Streamlines */}
            <g
              transform={`translate(736, 360) rotate(${wind.bearingDegrees})`}
              className="text-sky-600/70 dark:text-sky-400/70"
            >
              <circle
                cx="0"
                cy="0"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <line x1="0" y1="16" x2="0" y2="-16" stroke="currentColor" strokeWidth="1.75" />
              <polygon points="0,-20 -4.5,-11 4.5,-11" fill="currentColor" />
            </g>

            {/* Interactive 5 Regional Station Nodes */}
            {REGION_ORDER.map((id) => {
              const reg = regions[id];
              const display = getLayerDisplay(reg, activeLayer);
              const isSelected = selectedRegionId === id;
              const isHovered = hoveredId === id;
              const radiusScale = Math.min(62, Math.max(32, 26 + display.value * 0.16));

              return (
                <g
                  key={id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${reg.name} region: ${display.value} ${display.unit} (${display.label})`}
                  onClick={() => onSelectRegion(id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRegion(id);
                    }
                  }}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Dispersion Aura Circle */}
                  <circle
                    cx={reg.mapX}
                    cy={reg.mapY}
                    r={radiusScale}
                    fill={display.ringFillHex}
                    stroke={display.accentHex}
                    strokeWidth={isSelected || isHovered ? 2 : 1}
                    strokeOpacity={isSelected || isHovered ? 0.9 : 0.45}
                  />

                  {/* Selection Outer Ring */}
                  {isSelected && (
                    <circle
                      cx={reg.mapX}
                      cy={reg.mapY}
                      r={radiusScale + 6}
                      fill="none"
                      stroke={display.accentHex}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* Station Readout Card inside Map */}
                  <rect
                    x={reg.mapX - 42}
                    y={reg.mapY - 22}
                    width="84"
                    height="44"
                    rx="7"
                    className="fill-white dark:fill-[#0F141D]"
                    stroke={isSelected ? display.accentHex : '#CBD5E1'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  <text
                    x={reg.mapX}
                    y={reg.mapY - 6}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 font-sans text-[10px] font-semibold uppercase tracking-wider"
                  >
                    {reg.name}
                  </text>

                  <text
                    x={reg.mapX}
                    y={reg.mapY + 13}
                    textAnchor="middle"
                    className="fill-slate-900 dark:fill-slate-100 font-mono text-[15px] font-semibold"
                  >
                    {display.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Map Legend Strip */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400">● 0–50 Good</span>
            <span className="text-sky-700 dark:text-sky-400">◆ 51–100 Moderate</span>
            <span className="text-amber-700 dark:text-amber-400">▲ 101–200 Unhealthy</span>
            <span className="text-rose-700 dark:text-rose-400">■ 201–300 Very Unhealthy</span>
            <span className="text-red-900 dark:text-red-300">✖ 301+ Hazardous</span>
          </div>
          <span className="text-[11px]">
            Click any region marker to inspect station sub-indices and hourly trajectory.
          </span>
        </div>
      </div>
    </section>
  );
};

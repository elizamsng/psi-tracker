import React from 'react';
import type { RegionalReading } from '../types/psi';
import { getPsiBand, PSI_BANDS } from '../utils/psiBands';

interface HealthAdvisoryProps {
  region: RegionalReading;
}

const BAND_ORDER = ['good', 'moderate', 'unhealthy', 'very_unhealthy', 'hazardous'] as const;

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({ region }) => {
  const activeBand = getPsiBand(region.metrics.psi_twenty_four_hourly);

  const advisories = [
    {
      title: 'General Public',
      detail: activeBand.generalPublic,
    },
    {
      title: 'Vulnerable Groups',
      detail: activeBand.vulnerableGroups,
    },
    {
      title: 'Outdoor & School Activity',
      detail: activeBand.outdoorActivity,
    },
    {
      title: 'Indoor Air & Mask Guidance',
      detail: activeBand.indoorProtection,
    },
  ];

  return (
    <section
      id="health-guide"
      className="border border-slate-200 bg-white rounded-xl dark:border-slate-800 dark:bg-[#111722]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            NEA Health &amp; Activity Advisory — {region.name}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Guidance calibrated to 24-hr PSI {region.metrics.psi_twenty_four_hourly} (
            <span className={`font-medium ${activeBand.textClass}`}>
              {activeBand.glyph} {activeBand.label}
            </span>
            ) and 1-hr PM2.5 {region.metrics.pm25_one_hourly} µg/m³
          </p>
        </div>

        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          MOH / NEA Framework
        </span>
      </div>

      {/* 4-column flat guidance grid separated by hairline borders */}
      <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x dark:divide-slate-800">
        {advisories.map((item) => (
          <div key={item.title} className="p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Official PSI Scale Reference Strip */}
      <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-[#0B0E14]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {BAND_ORDER.map((key) => {
            const spec = PSI_BANDS[key];
            const isCurrent = spec.key === activeBand.key;
            return (
              <div
                key={key}
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  isCurrent
                    ? `${spec.bgTintClass} ${spec.borderClass}`
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111722]'
                }`}
              >
                <div className={`text-xs font-semibold ${spec.textClass}`}>
                  <span aria-hidden="true">{spec.glyph}</span> {spec.label}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  PSI {spec.rangeLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

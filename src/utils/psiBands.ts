import type { MetricLayer, PsiBandKey } from '../types/psi';

export interface PsiBandSpec {
  key: PsiBandKey;
  label: string;
  rangeLabel: string;
  glyph: string;
  textClass: string;
  bgTintClass: string;
  borderClass: string;
  accentHex: string;
  ringFillHex: string;
  generalPublic: string;
  vulnerableGroups: string;
  outdoorActivity: string;
  indoorProtection: string;
}

export const PSI_BANDS: Record<PsiBandKey, PsiBandSpec> = {
  good: {
    key: 'good',
    label: 'Good',
    rangeLabel: '0–50',
    glyph: '●',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    bgTintClass: 'bg-emerald-50/80 dark:bg-emerald-950/35',
    borderClass: 'border-emerald-200 dark:border-emerald-900/70',
    accentHex: '#16A34A',
    ringFillHex: 'rgba(22, 163, 74, 0.16)',
    generalPublic: 'Normal activities across all districts with no air quality restrictions.',
    vulnerableGroups: 'Safe for children, older adults, and individuals with respiratory conditions.',
    outdoorActivity: 'All outdoor sports, endurance training, and school recess can proceed.',
    indoorProtection: 'Natural cross-ventilation is optimal; mechanical air purifiers not required.',
  },
  moderate: {
    key: 'moderate',
    label: 'Moderate',
    rangeLabel: '51–100',
    glyph: '◆',
    textClass: 'text-sky-700 dark:text-sky-400',
    bgTintClass: 'bg-sky-50/80 dark:bg-sky-950/35',
    borderClass: 'border-sky-200 dark:border-sky-900/70',
    accentHex: '#0284C7',
    ringFillHex: 'rgba(2, 132, 199, 0.16)',
    generalPublic: 'Normal activities may continue; monitor 1-hr PM2.5 readings for sudden plumes.',
    vulnerableGroups: 'Heart or lung patients should keep quick-relief inhalers accessible.',
    outdoorActivity: 'Regular outdoor exercise can continue; take breaks if mild throat irritation occurs.',
    indoorProtection: 'Standard ventilation is fine; close windward windows if smoke odour is noticeable.',
  },
  unhealthy: {
    key: 'unhealthy',
    label: 'Unhealthy',
    rangeLabel: '101–200',
    glyph: '▲',
    textClass: 'text-amber-700 dark:text-amber-400',
    bgTintClass: 'bg-amber-50/80 dark:bg-amber-950/35',
    borderClass: 'border-amber-200 dark:border-amber-900/70',
    accentHex: '#D97706',
    ringFillHex: 'rgba(217, 119, 6, 0.20)',
    generalPublic: 'Reduce prolonged or strenuous outdoor physical exertion across affected regions.',
    vulnerableGroups: 'Minimise outdoor exposure; elderly, children, and pregnant women should stay indoors.',
    outdoorActivity: 'Shift high-intensity workouts and school physical education indoors.',
    indoorProtection: 'Keep windows closed, run HEPA air purifiers, and wear N95 masks for extended transit.',
  },
  very_unhealthy: {
    key: 'very_unhealthy',
    label: 'Very Unhealthy',
    rangeLabel: '201–300',
    glyph: '■',
    textClass: 'text-rose-700 dark:text-rose-400',
    bgTintClass: 'bg-rose-50/85 dark:bg-rose-950/40',
    borderClass: 'border-rose-200 dark:border-rose-900/70',
    accentHex: '#DC2626',
    ringFillHex: 'rgba(220, 38, 38, 0.22)',
    generalPublic: 'Avoid prolonged or strenuous outdoor exertion; limit non-essential outdoor trips.',
    vulnerableGroups: 'Avoid all outdoor activity; seek medical attention immediately if breathlessness develops.',
    outdoorActivity: 'Cancel outdoor events, competitive sports, and vigorous physical labour.',
    indoorProtection: 'Seal windows and doors, run air-conditioning on recirculate with HEPA filtration, use N95 outdoors.',
  },
  hazardous: {
    key: 'hazardous',
    label: 'Hazardous',
    rangeLabel: '301+',
    glyph: '✖',
    textClass: 'text-red-900 dark:text-red-300',
    bgTintClass: 'bg-red-100/90 dark:bg-red-950/60',
    borderClass: 'border-red-300 dark:border-red-800',
    accentHex: '#991B1B',
    ringFillHex: 'rgba(153, 27, 27, 0.26)',
    generalPublic: 'Minimise all outdoor activity; stay indoors with filtered air circulation.',
    vulnerableGroups: 'Remain strictly indoors in air-filtered spaces; activate clinical action plans.',
    outdoorActivity: 'Suspend all outdoor work and recreational activities island-wide.',
    indoorProtection: 'Ensure continuous HEPA filtration; fitted N95 respirator mandatory for any essential outdoor transit.',
  },
};

export function getPsiBand(psiValue: number): PsiBandSpec {
  if (psiValue <= 50) return PSI_BANDS.good;
  if (psiValue <= 100) return PSI_BANDS.moderate;
  if (psiValue <= 200) return PSI_BANDS.unhealthy;
  if (psiValue <= 300) return PSI_BANDS.very_unhealthy;
  return PSI_BANDS.hazardous;
}

export function getPm25HourlyBand(pm25: number): {
  label: string;
  textClass: string;
  glyph: string;
} {
  if (pm25 <= 55) {
    return { label: 'Normal', textClass: 'text-emerald-700 dark:text-emerald-400', glyph: '●' };
  }
  if (pm25 <= 150) {
    return { label: 'Elevated', textClass: 'text-amber-700 dark:text-amber-400', glyph: '▲' };
  }
  if (pm25 <= 250) {
    return { label: 'High', textClass: 'text-rose-700 dark:text-rose-400', glyph: '■' };
  }
  return { label: 'Very High', textClass: 'text-red-900 dark:text-red-300', glyph: '✖' };
}

export interface MetricLayerMeta {
  id: MetricLayer;
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
}

export const METRIC_LAYERS: MetricLayerMeta[] = [
  {
    id: 'psi_twenty_four_hourly',
    label: '24-hr PSI',
    shortLabel: 'PSI',
    unit: 'index',
    description: 'Official 24-hour Pollutant Standards Index across 6 sub-indices',
  },
  {
    id: 'pm25_one_hourly',
    label: '1-hr PM2.5',
    shortLabel: 'PM2.5 (1h)',
    unit: 'µg/m³',
    description: 'Immediate fine particulate concentration for short-term outdoor planning',
  },
  {
    id: 'pm25_twenty_four_hourly',
    label: '24-hr PM2.5',
    shortLabel: 'PM2.5 (24h)',
    unit: 'µg/m³',
    description: '24-hour rolling average concentration of particles ≤ 2.5 µm',
  },
  {
    id: 'pm10_twenty_four_hourly',
    label: '24-hr PM10',
    shortLabel: 'PM10',
    unit: 'µg/m³',
    description: '24-hour rolling average coarse inhalable particulates ≤ 10 µm',
  },
  {
    id: 'o3_sub_index',
    label: 'Ozone O₃',
    shortLabel: 'O₃',
    unit: 'sub-idx',
    description: '8-hour ground-level ozone sub-index',
  },
];

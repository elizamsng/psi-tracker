export type SpatialRegionId = 'north' | 'south' | 'east' | 'west' | 'central';
export type RegionId = SpatialRegionId | 'national';

export type MetricLayer =
  | 'psi_twenty_four_hourly'
  | 'pm25_one_hourly'
  | 'pm25_twenty_four_hourly'
  | 'pm10_twenty_four_hourly'
  | 'o3_sub_index';

export type PsiBandKey =
  | 'good'
  | 'moderate'
  | 'unhealthy'
  | 'very_unhealthy'
  | 'hazardous';

export type ScenarioId =
  | 'clear_monsoon'
  | 'moderate_haze'
  | 'transboundary_alert'
  | 'severe_episode';

export interface HourlyDataPoint {
  hourLabel: string;
  isoTimestamp: string;
  psi: number;
  pm25Hourly: number;
}

export interface PollutantMetrics {
  psi_twenty_four_hourly: number;
  pm25_one_hourly: number;
  pm25_twenty_four_hourly: number;
  pm25_sub_index: number;
  pm10_twenty_four_hourly: number;
  pm10_sub_index: number;
  o3_sub_index: number;
  co_sub_index: number;
  so2_sub_index: number;
  no2_one_hour_max: number;
}

export interface RegionalReading {
  id: RegionId;
  name: string;
  shortCode: string;
  towns: string[];
  latitude: number;
  longitude: number;
  /** Map projection coordinates in SVG viewBox (0..800 x 0..460) */
  mapX: number;
  mapY: number;
  metrics: PollutantMetrics;
  delta1h: number;
  dominantPollutant: 'PM2.5' | 'PM10' | 'O3' | 'SO2' | 'CO';
  hourlyTrend: HourlyDataPoint[];
}

export interface WindTelemetry {
  directionLabel: string;
  bearingDegrees: number;
  speedKmh: number;
  monsoonPhase: string;
}

export interface PsiSnapshot {
  scenarioId: ScenarioId;
  scenarioLabel: string;
  updatedAtIso: string;
  updatedAtSgt: string;
  sourceMode: 'preview_dataset' | 'live_api';
  wind: WindTelemetry;
  regions: Record<RegionId, RegionalReading>;
}

/**
 * Exact response schema returned by Singapore's National Environment Agency (NEA)
 * via data.gov.sg (/v1/environment/psi). Ready for direct API integration.
 */
export interface NEAPsiApiResponse {
  region_metadata: Array<{
    name: RegionId;
    label_location: {
      latitude: number;
      longitude: number;
    };
  }>;
  items: Array<{
    timestamp: string;
    update_timestamp: string;
    readings: {
      o3_sub_index: Record<RegionId, number>;
      pm10_twenty_four_hourly: Record<RegionId, number>;
      pm10_sub_index: Record<RegionId, number>;
      co_sub_index: Record<RegionId, number>;
      pm25_twenty_four_hourly: Record<RegionId, number>;
      so2_sub_index: Record<RegionId, number>;
      co_eight_hour_max: Record<RegionId, number>;
      no2_one_hour_max: Record<RegionId, number>;
      so2_twenty_four_hourly: Record<RegionId, number>;
      pm25_sub_index: Record<RegionId, number>;
      psi_twenty_four_hourly: Record<RegionId, number>;
      o3_eight_hour_max: Record<RegionId, number>;
    };
  }>;
  api_info: {
    status: string;
  };
}

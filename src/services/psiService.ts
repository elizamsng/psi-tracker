import type {
  HourlyDataPoint,
  NEAPsiApiResponse,
  PollutantMetrics,
  PsiSnapshot,
  RegionalReading,
  RegionId,
  ScenarioId,
  SpatialRegionId,
  WindTelemetry,
} from '../types/psi';

export const LIVE_NEA_PSI_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
export const SERVERLESS_PSI_ROUTE = '/api/psi';

export const REGION_ORDER: SpatialRegionId[] = ['north', 'central', 'east', 'west', 'south'];

type PreviewScenarioId = Exclude<ScenarioId, 'live'>;

export const SCENARIO_OPTIONS: Array<{ id: ScenarioId; label: string; summary: string }> = [
  {
    id: 'live',
    label: 'Live NEA Feed',
    summary: 'Real-time Singapore PSI telemetry via /api/psi serverless connection',
  },
  {
    id: 'clear_monsoon',
    label: 'Clear Monsoon',
    summary: 'Northeast breeze, clean maritime air across all districts',
  },
  {
    id: 'moderate_haze',
    label: 'Moderate Haze',
    summary: 'Light regional smoke drift raising West and Central particulates',
  },
  {
    id: 'transboundary_alert',
    label: 'Transboundary Alert',
    summary: 'Southwest monsoon smoke plume pushing PSI above 100 in West & Central',
  },
  {
    id: 'severe_episode',
    label: 'Severe Episode',
    summary: 'Dense regional haze event exceeding PSI 200 across the island',
  },
];

interface RegionMetadataStatic {
  id: RegionId;
  name: string;
  shortCode: string;
  towns: string[];
  latitude: number;
  longitude: number;
  mapX: number;
  mapY: number;
}

export const REGION_META: Record<RegionId, RegionMetadataStatic> = {
  national: {
    id: 'national',
    name: 'National (Islandwide)',
    shortCode: 'SGP',
    towns: ['All 5 Monitoring Regions'],
    latitude: 1.3521,
    longitude: 103.8198,
    mapX: 400,
    mapY: 230,
  },
  north: {
    id: 'north',
    name: 'North',
    shortCode: 'N',
    towns: ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Mandai'],
    latitude: 1.41803,
    longitude: 103.82,
    mapX: 402,
    mapY: 112,
  },
  central: {
    id: 'central',
    name: 'Central',
    shortCode: 'C',
    towns: ['Orchard', 'Bishan', 'Toa Payoh', 'Novena', 'Ang Mo Kio'],
    latitude: 1.35735,
    longitude: 103.82,
    mapX: 416,
    mapY: 218,
  },
  east: {
    id: 'east',
    name: 'East',
    shortCode: 'E',
    towns: ['Changi', 'Tampines', 'Pasir Ris', 'Bedok', 'Punggol'],
    latitude: 1.35735,
    longitude: 103.94,
    mapX: 598,
    mapY: 204,
  },
  west: {
    id: 'west',
    name: 'West',
    shortCode: 'W',
    towns: ['Jurong West', 'Clementi', 'Tuas', 'Choa Chu Kang', 'Bukit Batok'],
    latitude: 1.35735,
    longitude: 103.7,
    mapX: 208,
    mapY: 218,
  },
  south: {
    id: 'south',
    name: 'South',
    shortCode: 'S',
    towns: ['Marina Bay', 'Sentosa', 'HarbourFront', 'Tiong Bahru', 'Queenstown'],
    latitude: 1.29587,
    longitude: 103.82,
    mapX: 408,
    mapY: 318,
  },
};

interface ScenarioSeed {
  label: string;
  wind: WindTelemetry;
  metrics: Record<SpatialRegionId, PollutantMetrics>;
  deltas: Record<SpatialRegionId, number>;
}

const SCENARIO_SEEDS: Record<PreviewScenarioId, ScenarioSeed> = {
  clear_monsoon: {
    label: 'Clear Monsoon',
    wind: {
      directionLabel: 'NNE',
      bearingDegrees: 24,
      speedKmh: 21,
      monsoonPhase: 'Northeast Monsoon',
    },
    metrics: {
      north: {
        psi_twenty_four_hourly: 44,
        pm25_one_hourly: 14,
        pm25_twenty_four_hourly: 12,
        pm25_sub_index: 44,
        pm10_twenty_four_hourly: 24,
        pm10_sub_index: 24,
        o3_sub_index: 29,
        co_sub_index: 6,
        so2_sub_index: 5,
        no2_one_hour_max: 28,
      },
      central: {
        psi_twenty_four_hourly: 46,
        pm25_one_hourly: 16,
        pm25_twenty_four_hourly: 13,
        pm25_sub_index: 46,
        pm10_twenty_four_hourly: 26,
        pm10_sub_index: 26,
        o3_sub_index: 33,
        co_sub_index: 7,
        so2_sub_index: 6,
        no2_one_hour_max: 34,
      },
      east: {
        psi_twenty_four_hourly: 36,
        pm25_one_hourly: 11,
        pm25_twenty_four_hourly: 9,
        pm25_sub_index: 36,
        pm10_twenty_four_hourly: 20,
        pm10_sub_index: 20,
        o3_sub_index: 27,
        co_sub_index: 5,
        so2_sub_index: 4,
        no2_one_hour_max: 21,
      },
      west: {
        psi_twenty_four_hourly: 48,
        pm25_one_hourly: 18,
        pm25_twenty_four_hourly: 14,
        pm25_sub_index: 48,
        pm10_twenty_four_hourly: 29,
        pm10_sub_index: 29,
        o3_sub_index: 31,
        co_sub_index: 7,
        so2_sub_index: 9,
        no2_one_hour_max: 37,
      },
      south: {
        psi_twenty_four_hourly: 41,
        pm25_one_hourly: 13,
        pm25_twenty_four_hourly: 11,
        pm25_sub_index: 41,
        pm10_twenty_four_hourly: 23,
        pm10_sub_index: 23,
        o3_sub_index: 30,
        co_sub_index: 6,
        so2_sub_index: 7,
        no2_one_hour_max: 29,
      },
    },
    deltas: { north: -1, central: 0, east: -2, west: 1, south: -1 },
  },
  moderate_haze: {
    label: 'Moderate Haze',
    wind: {
      directionLabel: 'SSE',
      bearingDegrees: 158,
      speedKmh: 14,
      monsoonPhase: 'Inter-Monsoon Transition',
    },
    metrics: {
      north: {
        psi_twenty_four_hourly: 72,
        pm25_one_hourly: 36,
        pm25_twenty_four_hourly: 26,
        pm25_sub_index: 72,
        pm10_twenty_four_hourly: 49,
        pm10_sub_index: 49,
        o3_sub_index: 41,
        co_sub_index: 10,
        so2_sub_index: 9,
        no2_one_hour_max: 42,
      },
      central: {
        psi_twenty_four_hourly: 81,
        pm25_one_hourly: 44,
        pm25_twenty_four_hourly: 31,
        pm25_sub_index: 81,
        pm10_twenty_four_hourly: 56,
        pm10_sub_index: 53,
        o3_sub_index: 46,
        co_sub_index: 12,
        so2_sub_index: 10,
        no2_one_hour_max: 48,
      },
      east: {
        psi_twenty_four_hourly: 66,
        pm25_one_hourly: 29,
        pm25_twenty_four_hourly: 22,
        pm25_sub_index: 66,
        pm10_twenty_four_hourly: 45,
        pm10_sub_index: 45,
        o3_sub_index: 38,
        co_sub_index: 9,
        so2_sub_index: 8,
        no2_one_hour_max: 35,
      },
      west: {
        psi_twenty_four_hourly: 88,
        pm25_one_hourly: 51,
        pm25_twenty_four_hourly: 34,
        pm25_sub_index: 88,
        pm10_twenty_four_hourly: 64,
        pm10_sub_index: 57,
        o3_sub_index: 44,
        co_sub_index: 13,
        so2_sub_index: 14,
        no2_one_hour_max: 53,
      },
      south: {
        psi_twenty_four_hourly: 77,
        pm25_one_hourly: 39,
        pm25_twenty_four_hourly: 28,
        pm25_sub_index: 77,
        pm10_twenty_four_hourly: 52,
        pm10_sub_index: 51,
        o3_sub_index: 42,
        co_sub_index: 11,
        so2_sub_index: 12,
        no2_one_hour_max: 45,
      },
    },
    deltas: { north: 2, central: 4, east: 1, west: 5, south: 3 },
  },
  transboundary_alert: {
    label: 'Transboundary Alert',
    wind: {
      directionLabel: 'SSW',
      bearingDegrees: 208,
      speedKmh: 19,
      monsoonPhase: 'Southwest Monsoon Drift',
    },
    metrics: {
      north: {
        psi_twenty_four_hourly: 126,
        pm25_one_hourly: 92,
        pm25_twenty_four_hourly: 54,
        pm25_sub_index: 126,
        pm10_twenty_four_hourly: 96,
        pm10_sub_index: 73,
        o3_sub_index: 54,
        co_sub_index: 17,
        so2_sub_index: 15,
        no2_one_hour_max: 59,
      },
      central: {
        psi_twenty_four_hourly: 144,
        pm25_one_hourly: 114,
        pm25_twenty_four_hourly: 65,
        pm25_sub_index: 144,
        pm10_twenty_four_hourly: 112,
        pm10_sub_index: 81,
        o3_sub_index: 58,
        co_sub_index: 19,
        so2_sub_index: 16,
        no2_one_hour_max: 64,
      },
      east: {
        psi_twenty_four_hourly: 112,
        pm25_one_hourly: 78,
        pm25_twenty_four_hourly: 46,
        pm25_sub_index: 112,
        pm10_twenty_four_hourly: 86,
        pm10_sub_index: 68,
        o3_sub_index: 49,
        co_sub_index: 15,
        so2_sub_index: 13,
        no2_one_hour_max: 51,
      },
      west: {
        psi_twenty_four_hourly: 164,
        pm25_one_hourly: 138,
        pm25_twenty_four_hourly: 78,
        pm25_sub_index: 164,
        pm10_twenty_four_hourly: 129,
        pm10_sub_index: 90,
        o3_sub_index: 61,
        co_sub_index: 22,
        so2_sub_index: 21,
        no2_one_hour_max: 72,
      },
      south: {
        psi_twenty_four_hourly: 138,
        pm25_one_hourly: 106,
        pm25_twenty_four_hourly: 61,
        pm25_sub_index: 138,
        pm10_twenty_four_hourly: 104,
        pm10_sub_index: 77,
        o3_sub_index: 56,
        co_sub_index: 18,
        so2_sub_index: 18,
        no2_one_hour_max: 62,
      },
    },
    deltas: { north: 6, central: 9, east: 4, west: 12, south: 8 },
  },
  severe_episode: {
    label: 'Severe Episode',
    wind: {
      directionLabel: 'SW',
      bearingDegrees: 225,
      speedKmh: 11,
      monsoonPhase: 'Stagnant Haze Plume',
    },
    metrics: {
      north: {
        psi_twenty_four_hourly: 214,
        pm25_one_hourly: 192,
        pm25_twenty_four_hourly: 131,
        pm25_sub_index: 214,
        pm10_twenty_four_hourly: 188,
        pm10_sub_index: 119,
        o3_sub_index: 69,
        co_sub_index: 28,
        so2_sub_index: 24,
        no2_one_hour_max: 81,
      },
      central: {
        psi_twenty_four_hourly: 236,
        pm25_one_hourly: 218,
        pm25_twenty_four_hourly: 149,
        pm25_sub_index: 236,
        pm10_twenty_four_hourly: 204,
        pm10_sub_index: 127,
        o3_sub_index: 74,
        co_sub_index: 31,
        so2_sub_index: 25,
        no2_one_hour_max: 88,
      },
      east: {
        psi_twenty_four_hourly: 198,
        pm25_one_hourly: 168,
        pm25_twenty_four_hourly: 116,
        pm25_sub_index: 198,
        pm10_twenty_four_hourly: 171,
        pm10_sub_index: 111,
        o3_sub_index: 63,
        co_sub_index: 24,
        so2_sub_index: 20,
        no2_one_hour_max: 74,
      },
      west: {
        psi_twenty_four_hourly: 252,
        pm25_one_hourly: 241,
        pm25_twenty_four_hourly: 164,
        pm25_sub_index: 252,
        pm10_twenty_four_hourly: 226,
        pm10_sub_index: 138,
        o3_sub_index: 79,
        co_sub_index: 34,
        so2_sub_index: 30,
        no2_one_hour_max: 96,
      },
      south: {
        psi_twenty_four_hourly: 229,
        pm25_one_hourly: 209,
        pm25_twenty_four_hourly: 142,
        pm25_sub_index: 229,
        pm10_twenty_four_hourly: 196,
        pm10_sub_index: 123,
        o3_sub_index: 71,
        co_sub_index: 29,
        so2_sub_index: 27,
        no2_one_hour_max: 85,
      },
    },
    deltas: { north: 11, central: 14, east: 8, west: 18, south: 13 },
  },
};

function formatSgtTimestamp(date: Date): string {
  return (
    new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date) + ' SGT'
  );
}

function buildHourlySeries(
  currentPsi: number,
  currentPm25: number,
  delta1h: number,
  regionSeedOffset: number,
  anchorDate: Date
): HourlyDataPoint[] {
  const points: HourlyDataPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const pointTime = new Date(anchorDate.getTime() - i * 3600 * 1000);
    const hourStr = new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(pointTime);

    const progress = (23 - i) / 23;
    const diurnalWave =
      Math.sin(progress * Math.PI * 2 + regionSeedOffset) * Math.max(2, currentPsi * 0.05);
    const trendSlope = (progress - 1) * delta1h * 3.2;

    const psi =
      i === 0
        ? currentPsi
        : Math.max(8, Math.round(currentPsi + trendSlope + diurnalWave * (1 - progress * 0.45)));
    const pm25Hourly =
      i === 0
        ? currentPm25
        : Math.max(3, Math.round(currentPm25 + trendSlope * 0.85 + diurnalWave * 0.6));

    points.push({
      hourLabel: hourStr,
      isoTimestamp: pointTime.toISOString(),
      psi,
      pm25Hourly,
    });
  }
  return points;
}

function buildNationalAggregate(
  regionRecords: Record<RegionId, RegionalReading>
): RegionalReading {
  const spatialList = REGION_ORDER.map((id) => regionRecords[id]);
  const maxBy = (fn: (r: RegionalReading) => number) => Math.max(...spatialList.map(fn));
  const avgBy = (fn: (r: RegionalReading) => number) =>
    Math.round(spatialList.reduce((sum, r) => sum + fn(r), 0) / spatialList.length);

  const nationalMetrics: PollutantMetrics = {
    psi_twenty_four_hourly: maxBy((r) => r.metrics.psi_twenty_four_hourly),
    pm25_one_hourly: maxBy((r) => r.metrics.pm25_one_hourly),
    pm25_twenty_four_hourly: maxBy((r) => r.metrics.pm25_twenty_four_hourly),
    pm25_sub_index: maxBy((r) => r.metrics.pm25_sub_index),
    pm10_twenty_four_hourly: maxBy((r) => r.metrics.pm10_twenty_four_hourly),
    pm10_sub_index: maxBy((r) => r.metrics.pm10_sub_index),
    o3_sub_index: maxBy((r) => r.metrics.o3_sub_index),
    co_sub_index: maxBy((r) => r.metrics.co_sub_index),
    so2_sub_index: maxBy((r) => r.metrics.so2_sub_index),
    no2_one_hour_max: maxBy((r) => r.metrics.no2_one_hour_max),
  };

  const nationalTrend: HourlyDataPoint[] = spatialList[0].hourlyTrend.map((_, idx) => ({
    hourLabel: spatialList[0].hourlyTrend[idx].hourLabel,
    isoTimestamp: spatialList[0].hourlyTrend[idx].isoTimestamp,
    psi: Math.round(
      spatialList.reduce((acc, r) => acc + r.hourlyTrend[idx].psi, 0) / spatialList.length
    ),
    pm25Hourly: Math.round(
      spatialList.reduce((acc, r) => acc + r.hourlyTrend[idx].pm25Hourly, 0) / spatialList.length
    ),
  }));

  return {
    ...REGION_META.national,
    metrics: nationalMetrics,
    delta1h: avgBy((r) => r.delta1h),
    dominantPollutant: 'PM2.5',
    hourlyTrend: nationalTrend,
  };
}

function jitterValue(base: number, spread: number, minVal = 4): number {
  const offset = Math.round((Math.random() - 0.5) * 2 * spread);
  return Math.max(minVal, base + offset);
}

export async function fetchLivePsiSnapshot(): Promise<PsiSnapshot> {
  const response = await fetch(SERVERLESS_PSI_ROUTE, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    let message = `Serverless endpoint returned HTTP ${response.status}`;
    try {
      const errBody = (await response.json()) as { errorMsg?: string };
      if (errBody.errorMsg) message = errBody.errorMsg;
    } catch {
      // Keep default status message
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as NEAPsiApiResponse;
  return transformNeaApiResponse(payload);
}

export async function fetchPsiSnapshot(
  scenarioId: ScenarioId,
  simulateJitter = false
): Promise<PsiSnapshot> {
  if (scenarioId === 'live') {
    return fetchLivePsiSnapshot();
  }

  await new Promise((resolve) => setTimeout(resolve, simulateJitter ? 220 : 60));

  const seed = SCENARIO_SEEDS[scenarioId];
  const now = new Date();
  const regionRecords = {} as Record<RegionId, RegionalReading>;
  const regionOffsets: Record<SpatialRegionId, number> = {
    north: 0.4,
    central: 1.1,
    east: 2.2,
    west: 3.1,
    south: 1.7,
  };

  for (const regionId of REGION_ORDER) {
    const baseMetrics = seed.metrics[regionId];
    const spread = simulateJitter
      ? Math.max(2, Math.round(baseMetrics.psi_twenty_four_hourly * 0.04))
      : 0;
    const psiVal = spread
      ? jitterValue(baseMetrics.psi_twenty_four_hourly, spread, 15)
      : baseMetrics.psi_twenty_four_hourly;
    const pm25_1h = spread
      ? jitterValue(baseMetrics.pm25_one_hourly, spread, 6)
      : baseMetrics.pm25_one_hourly;

    const metrics: PollutantMetrics = {
      ...baseMetrics,
      psi_twenty_four_hourly: psiVal,
      pm25_sub_index: psiVal,
      pm25_one_hourly: pm25_1h,
    };

    const delta1h = simulateJitter
      ? seed.deltas[regionId] + Math.round((Math.random() - 0.5) * 4)
      : seed.deltas[regionId];

    const meta = REGION_META[regionId];
    regionRecords[regionId] = {
      ...meta,
      metrics,
      delta1h,
      dominantPollutant: 'PM2.5',
      hourlyTrend: buildHourlySeries(psiVal, pm25_1h, delta1h, regionOffsets[regionId], now),
    };
  }

  regionRecords.national = buildNationalAggregate(regionRecords);

  return {
    scenarioId,
    scenarioLabel: seed.label,
    updatedAtIso: now.toISOString(),
    updatedAtSgt: formatSgtTimestamp(now),
    sourceMode: 'preview_dataset',
    wind: seed.wind,
    regions: regionRecords,
  };
}

/**
 * Transforms Singapore data.gov.sg v2 PSI payload (/v2/real-time/api/psi)
 * into normalized SG Airwatch regional telemetry.
 */
export function transformNeaApiResponse(raw: NEAPsiApiResponse): PsiSnapshot {
  const latest = raw.data?.items?.[0];
  if (!latest) {
    throw new Error('Live NEA PSI response contained no reading items.');
  }

  const r = latest.readings;
  const anchor = new Date(latest.updatedTimestamp || latest.updateTimestamp || latest.timestamp);
  const regions = {} as Record<RegionId, RegionalReading>;
  const regionOffsets: Record<SpatialRegionId, number> = {
    north: 0.4,
    central: 1.1,
    east: 2.2,
    west: 3.1,
    south: 1.7,
  };

  const metadataMap = new Map(
    (raw.data.regionMetadata ?? []).map((item) => [item.name, item.labelLocation])
  );

  for (const id of REGION_ORDER) {
    const meta = REGION_META[id];
    const loc = metadataMap.get(id);
    const psiVal = r.psi_twenty_four_hourly?.[id] ?? 0;
    const pm25_24h = r.pm25_twenty_four_hourly?.[id] ?? 0;
    const pm25_1h = r.pm25_one_hourly?.[id] ?? pm25_24h;

    const metrics: PollutantMetrics = {
      psi_twenty_four_hourly: psiVal,
      pm25_one_hourly: pm25_1h,
      pm25_twenty_four_hourly: pm25_24h,
      pm25_sub_index: r.pm25_sub_index?.[id] ?? 0,
      pm10_twenty_four_hourly: r.pm10_twenty_four_hourly?.[id] ?? 0,
      pm10_sub_index: r.pm10_sub_index?.[id] ?? 0,
      o3_sub_index: r.o3_sub_index?.[id] ?? 0,
      co_sub_index: r.co_sub_index?.[id] ?? 0,
      so2_sub_index: r.so2_sub_index?.[id] ?? 0,
      no2_one_hour_max: r.no2_one_hour_max?.[id] ?? 0,
    };

    regions[id] = {
      ...meta,
      latitude: loc?.latitude ?? meta.latitude,
      longitude: loc?.longitude ?? meta.longitude,
      metrics,
      delta1h: 0,
      dominantPollutant: 'PM2.5',
      hourlyTrend: buildHourlySeries(psiVal, pm25_1h, 0, regionOffsets[id], anchor),
    };
  }

  regions.national = buildNationalAggregate(regions);

  return {
    scenarioId: 'live',
    scenarioLabel: 'Live NEA Feed',
    updatedAtIso: anchor.toISOString(),
    updatedAtSgt: formatSgtTimestamp(anchor),
    sourceMode: 'live_api',
    wind: {
      directionLabel: 'NE',
      bearingDegrees: 42,
      speedKmh: 16,
      monsoonPhase: 'Live NEA Telemetry',
    },
    regions,
  };
}

export function toNeaApiPayload(snapshot: PsiSnapshot): NEAPsiApiResponse {
  const pickMetric = (key: keyof PollutantMetrics) =>
    REGION_ORDER.reduce(
      (acc, id) => {
        acc[id] = snapshot.regions[id].metrics[key];
        return acc;
      },
      {} as Record<SpatialRegionId, number>
    );

  return {
    code: 0,
    errorMsg: '',
    data: {
      regionMetadata: REGION_ORDER.map((id) => ({
        name: id,
        labelLocation: {
          latitude: snapshot.regions[id].latitude,
          longitude: snapshot.regions[id].longitude,
        },
      })),
      items: [
        {
          date: snapshot.updatedAtIso.slice(0, 10),
          timestamp: snapshot.updatedAtIso,
          updatedTimestamp: snapshot.updatedAtIso,
          readings: {
            psi_twenty_four_hourly: pickMetric('psi_twenty_four_hourly'),
            pm25_one_hourly: pickMetric('pm25_one_hourly'),
            pm25_twenty_four_hourly: pickMetric('pm25_twenty_four_hourly'),
            pm25_sub_index: pickMetric('pm25_sub_index'),
            pm10_twenty_four_hourly: pickMetric('pm10_twenty_four_hourly'),
            pm10_sub_index: pickMetric('pm10_sub_index'),
            o3_sub_index: pickMetric('o3_sub_index'),
            o3_eight_hour_max: pickMetric('o3_sub_index'),
            co_sub_index: pickMetric('co_sub_index'),
            co_eight_hour_max: pickMetric('co_sub_index'),
            so2_sub_index: pickMetric('so2_sub_index'),
            so2_twenty_four_hourly: pickMetric('so2_sub_index'),
            no2_one_hour_max: pickMetric('no2_one_hour_max'),
          },
        },
      ],
    },
  };
}

export function exportReadingsToCsv(snapshot: PsiSnapshot): void {
  const headers = [
    'Timestamp_SGT',
    'Region',
    'PSI_24h',
    'PM25_1h_ug_m3',
    'PM25_24h_ug_m3',
    'PM10_24h_ug_m3',
    'O3_SubIndex',
    'CO_SubIndex',
    'SO2_SubIndex',
    'NO2_1h_Max',
  ];

  const rows: RegionId[] = ['national', ...REGION_ORDER];
  const lines = [
    headers.join(','),
    ...rows.map((id) => {
      const reg = snapshot.regions[id];
      const m = reg.metrics;
      return [
        `"${snapshot.updatedAtSgt}"`,
        `"${reg.name}"`,
        m.psi_twenty_four_hourly,
        m.pm25_one_hourly,
        m.pm25_twenty_four_hourly,
        m.pm10_twenty_four_hourly,
        m.o3_sub_index,
        m.co_sub_index,
        m.so2_sub_index,
        m.no2_one_hour_max,
      ].join(',');
    }),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sg-psi-snapshot-${snapshot.scenarioId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

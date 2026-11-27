/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import type { MetricLayer, PsiSnapshot, RegionId, ScenarioId } from './types/psi';
import {
  exportReadingsToCsv,
  fetchPsiSnapshot,
  REGION_ORDER,
} from './services/psiService';
import { getPm25HourlyBand, getPsiBand } from './utils/psiBands';
import { TopBar } from './components/TopBar';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { StationSidebar } from './components/StationSidebar';
import { SingaporeMap } from './components/SingaporeMap';
import { TrendChart } from './components/TrendChart';
import { PollutantMatrix } from './components/PollutantMatrix';
import { HealthAdvisory } from './components/HealthAdvisory';
import { ApiSchemaDrawer } from './components/ApiSchemaDrawer';

export default function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('live');
  const [snapshot, setSnapshot] = useState<PsiSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>('national');
  const [activeLayer, setActiveLayer] = useState<MetricLayer>('psi_twenty_four_hourly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApiDrawerOpen, setIsApiDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const loadSnapshot = async (targetScenario: ScenarioId, simulateJitter = false) => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const data = await fetchPsiSnapshot(targetScenario, simulateJitter);
      setSnapshot(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to fetch Singapore PSI readings.';
      setLoadError(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadSnapshot(scenarioId, false);
  }, [scenarioId]);

  const handleRefresh = () => {
    void loadSnapshot(scenarioId, scenarioId !== 'live');
  };

  const handleExportCsv = () => {
    if (snapshot) {
      exportReadingsToCsv(snapshot);
    }
  };

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0E14] dark:text-slate-100">
        <TopBar onOpenApiDrawer={() => setIsApiDrawerOpen(true)} />
        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
          {loadError ? (
            <div className="rounded-xl border border-rose-200 bg-white p-6 dark:border-rose-900/70 dark:bg-[#111722]">
              <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                Unable to load live NEA PSI data
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{loadError}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void loadSnapshot('live', false)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 cursor-pointer"
                >
                  Retry Live Connection
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioId('moderate_haze')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0B0E14] dark:text-slate-200 cursor-pointer"
                >
                  Open Haze Simulation Preview
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111722]" />
              <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111722]" />
            </div>
          )}
        </main>
      </div>
    );
  }

  const activeRegion = snapshot.regions[selectedRegionId];
  const activeBand = getPsiBand(activeRegion.metrics.psi_twenty_four_hourly);
  const activePm25Band = getPm25HourlyBand(activeRegion.metrics.pm25_one_hourly);

  const peakRegion = REGION_ORDER.map((id) => snapshot.regions[id]).reduce((highest, curr) =>
    curr.metrics.psi_twenty_four_hourly > highest.metrics.psi_twenty_four_hourly ? curr : highest
  );
  const peakBand = getPsiBand(peakRegion.metrics.psi_twenty_four_hourly);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0E14] dark:text-slate-100">
      <TopBar onOpenApiDrawer={() => setIsApiDrawerOpen(true)} />

      <WorkspaceToolbar
        scenarioId={scenarioId}
        onScenarioChange={setScenarioId}
        onRefresh={handleRefresh}
        onExportCsv={handleExportCsv}
        isRefreshing={isRefreshing}
        updatedAtSgt={snapshot.updatedAtSgt}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6">
        {loadError && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-3 text-xs text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <span>
              Live refresh failed ({loadError}). Showing most recent loaded readings.
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="font-semibold underline underline-offset-2 cursor-pointer"
            >
              Retry now
            </button>
          </div>
        )}

        {/* Overview Hero & 4-Column Telemetry Strip */}
        <section
          id="overview"
          className="border border-slate-200 bg-white rounded-xl dark:border-slate-800 dark:bg-[#111722]"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Singapore Atmospheric Console</span>
                <span aria-hidden="true">·</span>
                <span>{snapshot.scenarioLabel}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {snapshot.sourceMode === 'live_api'
                    ? 'Connected via /api/psi'
                    : 'Simulation Preview'}
                </span>
              </div>
              <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 [text-wrap:balance] sm:text-3xl dark:text-slate-100">
                Live PSI &amp; Regional Haze Tracker
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span>Inspecting:</span>
              <span className="font-display font-semibold text-slate-900 dark:text-slate-100">
                {activeRegion.name}
              </span>
              {selectedRegionId !== 'national' && (
                <button
                  type="button"
                  onClick={() => setSelectedRegionId('national')}
                  className="font-medium text-sky-700 hover:underline dark:text-sky-400 cursor-pointer whitespace-nowrap"
                >
                  View National
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x dark:divide-slate-800">
            {/* Metric 1: 24-hr PSI */}
            <div className="p-5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                24-hr PSI ({activeRegion.shortCode})
              </div>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {activeRegion.metrics.psi_twenty_four_hourly}
                </span>
                <span className={`text-xs font-semibold ${activeBand.textClass}`}>
                  <span aria-hidden="true">{activeBand.glyph}</span> {activeBand.label}
                </span>
              </div>
              <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                Band {activeBand.rangeLabel} · 1h Δ{' '}
                {activeRegion.delta1h > 0 ? `+${activeRegion.delta1h}` : activeRegion.delta1h}
              </div>
            </div>

            {/* Metric 2: 1-hr PM2.5 */}
            <div className="p-5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                1-hr PM2.5 Concentration
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {activeRegion.metrics.pm25_one_hourly}
                </span>
                <span className="font-mono text-xs text-slate-400">µg/m³</span>
                <span className={`ml-1.5 text-xs font-semibold ${activePm25Band.textClass}`}>
                  <span aria-hidden="true">{activePm25Band.glyph}</span> {activePm25Band.label}
                </span>
              </div>
              <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                24-hr Avg: {activeRegion.metrics.pm25_twenty_four_hourly} µg/m³
              </div>
            </div>

            {/* Metric 3: Peak Regional Station */}
            <div className="p-5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Highest Regional Reading
              </div>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {peakRegion.metrics.psi_twenty_four_hourly}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRegionId(peakRegion.id)}
                  className="font-display text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400 cursor-pointer"
                >
                  {peakRegion.name} Zone
                </button>
              </div>
              <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                <span className={peakBand.textClass}>
                  {peakBand.glyph} {peakBand.label}
                </span>{' '}
                · {peakRegion.towns[0]}
              </div>
            </div>

            {/* Metric 4: Surface Wind & Drift */}
            <div className="p-5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Surface Wind Vector
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {snapshot.wind.directionLabel}
                </span>
                <span className="font-mono text-sm font-medium text-slate-600 dark:text-slate-300">
                  {snapshot.wind.speedKmh} km/h
                </span>
              </div>
              <div className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                {snapshot.wind.monsoonPhase} ({snapshot.wind.bearingDegrees}°)
              </div>
            </div>
          </div>
        </section>

        {/* Primary Split Workspace: Left Station List + Right Map & Trajectory */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 xl:col-span-3">
            <StationSidebar
              regions={snapshot.regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
            />
          </div>

          <div className="space-y-6 lg:col-span-8 xl:col-span-9">
            <SingaporeMap
              regions={snapshot.regions}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
              activeLayer={activeLayer}
              onChangeLayer={setActiveLayer}
              wind={snapshot.wind}
            />

            <TrendChart
              regions={snapshot.regions}
              selectedRegionId={selectedRegionId}
            />
          </div>
        </div>

        {/* Pollutant Sub-Index Table */}
        <PollutantMatrix
          regions={snapshot.regions}
          selectedRegionId={selectedRegionId}
          onSelectRegion={setSelectedRegionId}
        />

        {/* Health & Activity Advisory */}
        <HealthAdvisory region={activeRegion} />
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F141D]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-slate-500 sm:px-6 dark:text-slate-400">
          <span>
            SG Airwatch · Live PSI telemetry sourced from Singapore National Environment Agency
            (NEA) via Data.gov.sg.
          </span>
          <button
            type="button"
            onClick={() => setIsApiDrawerOpen(true)}
            className="font-medium text-slate-700 hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white cursor-pointer"
          >
            View Data.gov.sg API Contract
          </button>
        </div>
      </footer>

      <ApiSchemaDrawer
        isOpen={isApiDrawerOpen}
        onClose={() => setIsApiDrawerOpen(false)}
        snapshot={snapshot}
      />
    </div>
  );
}

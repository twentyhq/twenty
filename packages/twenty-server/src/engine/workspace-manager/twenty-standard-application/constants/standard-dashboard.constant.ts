import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';

/**
 * Standard Dashboard constants for workspace schema record seeding.
 *
 * Unlike metadata entities, workspace records use `seedName` for deterministic
 * ID generation via generateSeedId(), not universalIdentifier.
 */
export const STANDARD_DASHBOARDS = {
  revenueOverview: {
    seedName: 'REVENUE_OVERVIEW_DASHBOARD_RECORD',
    title: 'Revenue Overview',
    pageLayoutUniversalIdentifier:
      STANDARD_PAGE_LAYOUTS.revenueOverview.universalIdentifier,
  },
} as const;

export type StandardDashboardName = keyof typeof STANDARD_DASHBOARDS;

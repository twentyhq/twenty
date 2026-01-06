import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';

export const STANDARD_DASHBOARDS = {
  revenueOverview: {
    seedName: 'REVENUE_OVERVIEW_DASHBOARD_RECORD',
    title: 'Revenue Overview',
    pageLayoutUniversalIdentifier:
      STANDARD_PAGE_LAYOUTS.revenueOverview.universalIdentifier,
  },
} as const;

export type StandardDashboardName = keyof typeof STANDARD_DASHBOARDS;

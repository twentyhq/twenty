import { type DashboardKpi } from '../types/dashboard-kpi';
import { type DashboardMonth } from '../types/dashboard-month';
import { type DashboardStage } from '../types/dashboard-stage';

export const DASHBOARD_VISUAL_DATA: {
  byMonth: DashboardMonth[];
  kpis: DashboardKpi[];
  stages: DashboardStage[];
  stageTotals: number[];
} = {
  stages: [
    { label: 'New', tone: 'blue' },
    { label: 'Qualified', tone: 'purple' },
    { label: 'Proposal', tone: 'turquoise' },
    { label: 'Won', tone: 'orange' },
  ],
  stageTotals: [47, 34, 27, 20],
  byMonth: [
    { label: 'Jan', values: [7, 5, 4, 2] },
    { label: 'Feb', values: [9, 6, 5, 3] },
    { label: 'Mar', values: [8, 6, 4, 2] },
    { label: 'Apr', values: [12, 8, 6, 4] },
    { label: 'May', values: [15, 11, 8, 5] },
    { label: 'Jun', values: [13, 9, 7, 4] },
    { label: 'Jul', values: [17, 12, 9, 6] },
  ],
  kpis: [
    {
      label: 'Revenue (YTD)',
      trendDirection: 'up',
      trendPercent: 12,
      value: '$1.2M',
    },
    {
      label: 'Avg deal size',
      trendDirection: 'up',
      trendPercent: 5,
      value: '$9.4K',
    },
    {
      label: 'Win rate',
      trendDirection: 'down',
      trendPercent: 3,
      value: '34%',
    },
  ],
};

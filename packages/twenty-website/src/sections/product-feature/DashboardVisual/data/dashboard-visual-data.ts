import { type DashboardKpi } from '../types/dashboard-kpi';
import { type DashboardMonth } from '../types/dashboard-month';
import { type DashboardStage } from '../types/dashboard-stage';

export const DASHBOARD_VISUAL_DATA: {
  byMonth: DashboardMonth[];
  kpis: DashboardKpi[];
  stages: DashboardStage[];
} = {
  stages: [
    { label: 'New', tone: 'red', value: 47 },
    { label: 'Screening', tone: 'purple', value: 34 },
    { label: 'Meeting', tone: 'sky', value: 27 },
    { label: 'Proposal', tone: 'turquoise', value: 20 },
    { label: 'Customer', tone: 'yellow', value: 12 },
  ],
  byMonth: [
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 16 },
    { label: 'Mar', value: 14 },
    { label: 'Apr', value: 22 },
    { label: 'May', value: 27 },
    { label: 'Jun', value: 24 },
    { label: 'Jul', value: 31 },
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

// The Sales Dashboard — extracted verbatim from the old data.
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';
import { type DashboardData, type DashboardPageDefinition } from '../types';

const SALES_DASHBOARD_DATA: DashboardData = {
  kpis: [
    {
      id: 'pipeline',
      title: 'Pipeline',
      value: '$12.9M',
      trend: { direction: 'up', value: '+8%' },
    },
    {
      id: 'won-this-quarter',
      title: 'Won this quarter',
      value: '$2.4M',
      trend: { direction: 'up', value: '+12%' },
    },
    {
      id: 'win-rate',
      title: 'Win rate',
      value: '38%',
      trend: { direction: 'down', value: '-3%' },
    },
  ],
  lineChart: {
    title: 'ARR over time',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    values: [3.1, 3.8, 3.5, 4.6, 5.4, 6.1, 7.2],
  },
  barChart: {
    title: 'Deals by stage',
    bars: [
      { label: 'New', value: 12 },
      { label: 'Screening', value: 9 },
      { label: 'Meeting', value: 7 },
      { label: 'Proposal', value: 5 },
      { label: 'Customer', value: 4 },
    ],
  },
  donutChart: {
    title: 'By industry',
    centerValue: '24',
    centerLabel: 'deals',
    slices: [
      { label: 'AI', value: 8, color: APP_PREVIEW_TONES.dashboardChart.accent },
      {
        label: 'Fintech',
        value: 6,
        color: APP_PREVIEW_TONES.dashboardChart.slicePurple,
      },
      {
        label: 'SaaS',
        value: 5,
        color: APP_PREVIEW_TONES.dashboardChart.trendUp,
      },
      {
        label: 'Other',
        value: 5,
        color: APP_PREVIEW_TONES.dashboardChart.sliceOrange,
      },
    ],
  },
};

export const SALES_DASHBOARD_PAGE: DashboardPageDefinition = {
  type: 'dashboard',
  header: {
    title: 'Sales Dashboard',
  },
  dashboard: SALES_DASHBOARD_DATA,
};

// The dashboard widgets' mock series (product-screenshot fiction). One stage
// list drives both charts, so a colour means the same thing everywhere: blue =
// New, purple = Qualified, turquoise = Proposal, orange = Won. The donut is the
// current pipeline snapshot; the stacked bars are the same stages over time.
export type DashboardStageTone = 'blue' | 'orange' | 'purple' | 'turquoise';

export type DashboardStage = {
  label: string;
  tone: DashboardStageTone;
};

export type DashboardKpi = {
  label: string;
  trendDirection: 'down' | 'up';
  trendPercent: number;
  value: string;
};

export type DashboardMonth = {
  label: string;
  // deal counts per stage, index-aligned to DASHBOARD_VISUAL_DATA.stages
  values: number[];
};

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
  // current pipeline snapshot (the donut), index-aligned to stages
  stageTotals: [47, 34, 27, 20],
  // deals worked each month, split by stage (the stacked bars)
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

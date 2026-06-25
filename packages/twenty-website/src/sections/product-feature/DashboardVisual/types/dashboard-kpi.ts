export type DashboardKpi = {
  label: string;
  trendDirection: 'down' | 'up';
  trendPercent: number;
  value: string;
};

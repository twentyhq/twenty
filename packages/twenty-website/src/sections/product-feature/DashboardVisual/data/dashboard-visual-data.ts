import { msg } from '@lingui/core/macro';

import { type DashboardKpi } from '../types/dashboard-kpi';
import { type DashboardMonth } from '../types/dashboard-month';
import { type DashboardStage } from '../types/dashboard-stage';

export const DASHBOARD_VISUAL_DATA: {
  byMonth: DashboardMonth[];
  kpis: DashboardKpi[];
  stages: DashboardStage[];
} = {
  stages: [
    { id: 'new', label: msg`New`, tone: 'red', value: 47 },
    { id: 'screening', label: msg`Screening`, tone: 'purple', value: 34 },
    { id: 'meeting', label: msg`Meeting`, tone: 'sky', value: 27 },
    { id: 'proposal', label: msg`Proposal`, tone: 'turquoise', value: 20 },
    { id: 'customer', label: msg`Customer`, tone: 'yellow', value: 12 },
  ],
  byMonth: [
    { id: 'jan', label: msg`Jan`, value: 12 },
    { id: 'feb', label: msg`Feb`, value: 16 },
    { id: 'mar', label: msg`Mar`, value: 14 },
    { id: 'apr', label: msg`Apr`, value: 22 },
    { id: 'may', label: msg`May`, value: 27 },
    { id: 'jun', label: msg`Jun`, value: 24 },
    { id: 'jul', label: msg`Jul`, value: 31 },
  ],
  kpis: [
    {
      id: 'revenue',
      label: msg`Revenue (YTD)`,
      trendDirection: 'up',
      trendPercent: 12,
      value: '$1.2M',
    },
    {
      id: 'avg-deal-size',
      label: msg`Avg deal size`,
      trendDirection: 'up',
      trendPercent: 5,
      value: '$9.4K',
    },
    {
      id: 'win-rate',
      label: msg`Win rate`,
      trendDirection: 'down',
      trendPercent: 3,
      value: '34%',
    },
  ],
};

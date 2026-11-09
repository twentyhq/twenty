import { type PageLayoutFilterCondition } from './PageLayoutFilter';
import { type PageLayoutFilterType } from './PageLayoutFilterType';

export type DashboardFilterValue = {
  pageLayoutFilterId: string;
  type: PageLayoutFilterType;
  conditions: PageLayoutFilterCondition[];
};

import { DASHBOARD_DATE_RANGE_FILTER_ID } from '@/constants/DashboardDateRangeFilterId';
import { doNotTranslate } from '@/i18n/do-not-translate';
import { type PageLayoutFilter, PageLayoutFilterType } from '@/types';

export const DASHBOARD_DATE_RANGE_FILTER: PageLayoutFilter = {
  id: DASHBOARD_DATE_RANGE_FILTER_ID,
  // Clients translate the label by id
  label: doNotTranslate('Date range'),
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

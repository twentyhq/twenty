import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { type DateTimePeriod } from 'twenty-shared/utils';

export const DATE_TIME_PERIOD_BY_GAP_FILLED_DATE_GRANULARITY: Partial<
  Record<ObjectRecordGroupByDateGranularity, DateTimePeriod>
> = {
  [ObjectRecordGroupByDateGranularity.DAY]: 'DAY',
  [ObjectRecordGroupByDateGranularity.WEEK]: 'WEEK',
  [ObjectRecordGroupByDateGranularity.MONTH]: 'MONTH',
  [ObjectRecordGroupByDateGranularity.QUARTER]: 'QUARTER',
  [ObjectRecordGroupByDateGranularity.YEAR]: 'YEAR',
};

import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';

export type SupportedDateGranularityForGapFilling =
  | ObjectRecordGroupByDateGranularity.DAY
  | ObjectRecordGroupByDateGranularity.MONTH
  | ObjectRecordGroupByDateGranularity.QUARTER
  | ObjectRecordGroupByDateGranularity.YEAR
  | ObjectRecordGroupByDateGranularity.WEEK;

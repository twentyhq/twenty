import { type HydratedRecordFilter } from '@/utils/filter/HydratedRecordFilter';
import {
  hydrateRecordFilter,
  type ResolveField,
} from '@/utils/filter/hydrateRecordFilter';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isDefined } from '@/utils/validation/isDefined';

export const hydrateRecordFilters = (
  recordFilters: RecordFilter[],
  resolveField: ResolveField,
): HydratedRecordFilter[] =>
  recordFilters
    .map((recordFilter) => hydrateRecordFilter(recordFilter, resolveField))
    .filter(isDefined);

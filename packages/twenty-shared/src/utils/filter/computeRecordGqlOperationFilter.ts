import {
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
} from '@/types';
import {
  turnRecordFilterGroupsIntoGqlOperationFilter,
  type RecordFilter,
  type RecordFilterGroup,
} from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import {
  type FindFieldMetadataItemById,
  turnRecordFilterIntoRecordGqlOperationFilter,
} from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';
import { isDefined } from '@/utils/validation/isDefined';

export const computeRecordGqlOperationFilter = ({
  findFieldMetadataItemById,
  recordFilters,
  recordFilterGroups,
  filterValueDependencies,
}: {
  recordFilters: Omit<RecordFilter, 'id'>[];
  findFieldMetadataItemById: FindFieldMetadataItemById;
  recordFilterGroups: RecordFilterGroup[];
  filterValueDependencies: RecordFilterValueDependencies;
}): RecordGqlOperationFilter => {
  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] =
    recordFilters
      .filter((filter) => !isDefined(filter.recordFilterGroupId))
      .map((regularFilter) => {
        return turnRecordFilterIntoRecordGqlOperationFilter({
          recordFilter: regularFilter,
          findFieldMetadataItemById,
          filterValueDependencies,
        });
      })
      .filter(isDefined);

  const outermostFilterGroupId = recordFilterGroups.find(
    (recordFilterGroup) => !recordFilterGroup.parentRecordFilterGroupId,
  )?.id;

  const advancedRecordGqlOperationFilter =
    turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies,
      filters: recordFilters,
      findFieldMetadataItemById,
      recordFilterGroups,
      currentRecordFilterGroupId: outermostFilterGroupId,
    });

  const recordGqlOperationFilters = [
    ...regularRecordGqlOperationFilter,
    advancedRecordGqlOperationFilter,
  ].filter(isDefined);

  if (recordGqlOperationFilters.length === 0) {
    return {};
  }

  if (recordGqlOperationFilters.length === 1) {
    return recordGqlOperationFilters[0];
  }

  const recordGqlOperationFilter = {
    and: recordGqlOperationFilters,
  };

  return recordGqlOperationFilter;
};

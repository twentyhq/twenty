
import {
  type PartialFieldMetadataItem,
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
} from '@/types';
import {
  isDefined,
  turnRecordFilterGroupsIntoGqlOperationFilter,
  turnRecordFilterIntoRecordGqlOperationFilter,
  type RecordFilterGroupShared,
  type RecordFilterShared,
} from '@/utils';

export const computeRecordGqlOperationFilter = ({
  fields,
  recordFilters,
  recordFilterGroups,
  filterValueDependencies,
  throwCustomError = (errorMessage: string) => {throw new Error(errorMessage);},
}: {
  recordFilters: RecordFilterShared[];
  fields: PartialFieldMetadataItem[];
  recordFilterGroups: RecordFilterGroupShared[];
  filterValueDependencies: RecordFilterValueDependencies;
  throwCustomError?: (message: string, code?: string) => never;
}): RecordGqlOperationFilter => {
  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] =
    recordFilters
      .filter((filter) => !isDefined(filter.recordFilterGroupId))
      .map((regularFilter) => {
        return turnRecordFilterIntoRecordGqlOperationFilter({
          recordFilter: regularFilter,
          fieldMetadataItems: fields,
          filterValueDependencies,
          throwCustomError,
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
      fields,
      recordFilterGroups,
      currentRecordFilterGroupId: outermostFilterGroupId,
      throwCustomError
    }
    );

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

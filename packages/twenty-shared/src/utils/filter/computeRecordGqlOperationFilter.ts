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
  type FieldShared,
  turnRecordFilterIntoRecordGqlOperationFilter,
} from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';
import { findRootRecordFilterGroup } from '@/utils/filter/findRootRecordFilterGroup';
import { isDefined } from '@/utils/validation/isDefined';

export const computeRecordGqlOperationFilter = ({
  fieldMetadataItems,
  recordFilters,
  recordFilterGroups,
  filterValueDependencies,
}: {
  recordFilters: Omit<RecordFilter, 'id'>[];
  fieldMetadataItems: FieldShared[];
  recordFilterGroups: RecordFilterGroup[];
  filterValueDependencies: RecordFilterValueDependencies;
}): RecordGqlOperationFilter => {
  const fieldMetadataItemById = new Map(
    fieldMetadataItems.map((field) => [field.id, field]),
  );

  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] =
    recordFilters
      .filter((filter) => !isDefined(filter.recordFilterGroupId))
      .map((regularFilter) => {
        return turnRecordFilterIntoRecordGqlOperationFilter({
          recordFilter: regularFilter,
          fieldMetadataItemById,
          filterValueDependencies,
        });
      })
      .filter(isDefined);

  const outermostFilterGroupId =
    findRootRecordFilterGroup(recordFilterGroups)?.id;

  const advancedRecordGqlOperationFilter =
    turnRecordFilterGroupsIntoGqlOperationFilter({
      filterValueDependencies,
      filters: recordFilters,
      fieldMetadataItemById,
      recordFilterGroups,
      currentRecordFilterGroupId: outermostFilterGroupId,
    });

  const recordGqlOperationFilters = [
    ...regularRecordGqlOperationFilter,
    advancedRecordGqlOperationFilter,
  ].filter(isDefined);

  const [firstRecordGqlOperationFilter] = recordGqlOperationFilters;

  if (!isDefined(firstRecordGqlOperationFilter)) {
    return {};
  }

  if (recordGqlOperationFilters.length === 1) {
    return firstRecordGqlOperationFilter;
  }

  const recordGqlOperationFilter = {
    and: recordGqlOperationFilters,
  };

  return recordGqlOperationFilter;
};

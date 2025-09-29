import { type CompositeFieldSubFieldName, type FilterableAndTSVectorFieldType, type PartialFieldMetadataItem, RecordFilterGroupLogicalOperator, type RecordFilterValueDependencies, type RecordGqlOperationFilter, type ViewFilterOperand } from '@/types';

import { isDefined } from '@/utils';
import { turnRecordFilterIntoRecordGqlOperationFilter } from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';

export type RecordFilterShared = {
  id: string;
  fieldMetadataId: string;
  value: string;
  type: FilterableAndTSVectorFieldType;
  recordFilterGroupId?: string | null;
  operand: ViewFilterOperand;
  subFieldName?: CompositeFieldSubFieldName | null | undefined;
};

export type RecordFilterGroupShared = {
  id: string;
  parentRecordFilterGroupId?: string | null;
  logicalOperator: RecordFilterGroupLogicalOperator;
}

export const turnRecordFilterGroupsIntoGqlOperationFilter = ({
  filterValueDependencies,
  filters,
  fields,
  recordFilterGroups,
  currentRecordFilterGroupId,
  throwCustomError,
}: {
  filterValueDependencies: RecordFilterValueDependencies,
  filters: RecordFilterShared[],
  fields: PartialFieldMetadataItem[],
  recordFilterGroups: RecordFilterGroupShared[],
  throwCustomError: (message: string, code?: string) => never,
  currentRecordFilterGroupId?: string,
}): RecordGqlOperationFilter | undefined => {
  const currentRecordFilterGroup = recordFilterGroups.find(
    (recordFilterGroup) => recordFilterGroup.id === currentRecordFilterGroupId,
  );

  if (!isDefined(currentRecordFilterGroup)) {
    return;
  }

  const recordFiltersInGroup = filters.filter(
    (filter) => filter.recordFilterGroupId === currentRecordFilterGroupId,
  );

  const groupRecordGqlOperationFilters = recordFiltersInGroup
    .map((recordFilter) => 
      turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies,
        recordFilter: recordFilter,
        fieldMetadataItems: fields,
        throwCustomError,
      }),
    )
    .filter(isDefined);

  const subGroupRecordGqlOperationFilters = recordFilterGroups
    .filter(
      (recordFilterGroup) =>
        recordFilterGroup.parentRecordFilterGroupId ===
        currentRecordFilterGroupId,
    )
    .map((subRecordFilterGroup) =>
      turnRecordFilterGroupsIntoGqlOperationFilter({
        filterValueDependencies,
        filters,
        fields,
        recordFilterGroups,
        currentRecordFilterGroupId: subRecordFilterGroup.id,
        throwCustomError,}
      ),
    )
    .filter(isDefined);

  if (
    currentRecordFilterGroup.logicalOperator ===
    RecordFilterGroupLogicalOperator.AND
  ) {
    return {
      and: [
        ...groupRecordGqlOperationFilters,
        ...subGroupRecordGqlOperationFilters,
      ],
    };
  } else if (
    currentRecordFilterGroup.logicalOperator ===
    RecordFilterGroupLogicalOperator.OR
  ) {
    return {
      or: [
        ...groupRecordGqlOperationFilters,
        ...subGroupRecordGqlOperationFilters,
      ],
    };
  } else {
    throw new Error(
      `Unknown logical operator ${currentRecordFilterGroup.logicalOperator}`,
    );
  }
};

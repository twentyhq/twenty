import {
  type CompositeFieldSubFieldName,
  type FilterableAndTSVectorFieldType,
  RecordFilterGroupLogicalOperator,
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
  type ViewFilterOperand,
} from '@/types';

import { isDefined } from '@/utils';
import {
  type FieldShared,
  turnRecordFilterIntoRecordGqlOperationFilter,
} from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';

export type RecordFilter = {
  id: string;
  fieldMetadataId: string;
  value: string;
  type: FilterableAndTSVectorFieldType;
  recordFilterGroupId?: string | null;
  operand: ViewFilterOperand;
  subFieldName?: CompositeFieldSubFieldName | null | undefined;
  relationTargetFieldMetadataId?: string | null | undefined;
};

export type RecordFilterGroup = {
  id: string;
  parentRecordFilterGroupId?: string | null;
  logicalOperator: RecordFilterGroupLogicalOperator;
};

export const turnRecordFilterGroupsIntoGqlOperationFilter = ({
  filterValueDependencies,
  filters,
  fieldMetadataItemById,
  recordFilterGroups,
  currentRecordFilterGroupId,
}: {
  filterValueDependencies: RecordFilterValueDependencies;
  filters: Omit<RecordFilter, 'id'>[];
  fieldMetadataItemById: Map<string, FieldShared>;
  recordFilterGroups: RecordFilterGroup[];
  currentRecordFilterGroupId?: string;
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
        fieldMetadataItemById,
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
        fieldMetadataItemById,
        recordFilterGroups,
        currentRecordFilterGroupId: subRecordFilterGroup.id,
      }),
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

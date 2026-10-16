import {
  type ChartFilter,
  type CompositeFieldSubFieldName,
  type RecordFilterGroupLogicalOperator,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeRecordGqlOperationFilterFromFlatMaps } from 'src/engine/utils/compute-record-gql-operation-filter-from-flat-maps.util';

type ConvertChartFilterToGqlOperationFilterParams = {
  filter: ChartFilter | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  userTimezone: string;
  currentWorkspaceMemberId?: string;
};

export const convertChartFilterToGqlOperationFilter = ({
  filter,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  userTimezone,
  currentWorkspaceMemberId,
}: ConvertChartFilterToGqlOperationFilterParams): ObjectRecordFilter => {
  if (!isDefined(filter)) {
    return {};
  }

  const recordFilters = filter.recordFilters ?? [];
  const recordFilterGroups = filter.recordFilterGroups ?? [];

  if (recordFilters.length === 0 && recordFilterGroups.length === 0) {
    return {};
  }

  const convertedRecordFilters: Omit<RecordFilter, 'id'>[] = recordFilters.map(
    (recordFilter) => ({
      fieldMetadataId: recordFilter.fieldMetadataId,
      value: recordFilter.value ?? '',
      recordFilterGroupId: recordFilter.recordFilterGroupId ?? undefined,
      operand: recordFilter.operand as ViewFilterOperand,
      subFieldName: (recordFilter.subFieldName ?? undefined) as
        | CompositeFieldSubFieldName
        | undefined,
      relationTargetFieldMetadataId:
        recordFilter.relationTargetFieldMetadataId ?? null,
    }),
  );

  const convertedRecordFilterGroups: RecordFilterGroup[] =
    recordFilterGroups.map((recordFilterGroup) => ({
      id: recordFilterGroup.id,
      parentRecordFilterGroupId:
        recordFilterGroup.parentRecordFilterGroupId ?? undefined,
      logicalOperator:
        recordFilterGroup.logicalOperator as RecordFilterGroupLogicalOperator,
    }));

  return computeRecordGqlOperationFilterFromFlatMaps({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    recordFilters: convertedRecordFilters,
    recordFilterGroups: convertedRecordFilterGroups,
    filterValueDependencies: {
      timeZone: userTimezone,
      currentWorkspaceMemberId,
    },
  });
};

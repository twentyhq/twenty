import {
  type ChartFilter,
  type CompositeFieldSubFieldName,
  type FilterableAndTSVectorFieldType,
  type RecordFilterGroupLogicalOperator,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type ConvertChartFilterToGqlOperationFilterParams = {
  filter: ChartFilter | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userTimezone: string;
  currentWorkspaceMemberId?: string;
};

export const convertChartFilterToGqlOperationFilter = ({
  filter,
  flatFieldMetadataMaps,
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
    (recordFilter) => {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: recordFilter.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      return {
        fieldMetadataId: recordFilter.fieldMetadataId,
        value: recordFilter.value ?? '',
        type: (field?.type ??
          recordFilter.type ??
          '') as FilterableAndTSVectorFieldType,
        recordFilterGroupId: recordFilter.recordFilterGroupId ?? undefined,
        operand: recordFilter.operand as ViewFilterOperand,
        subFieldName: (recordFilter.subFieldName ?? undefined) as
          | CompositeFieldSubFieldName
          | undefined,
        relationTargetFieldMetadataId:
          recordFilter.relationTargetFieldMetadataId ?? null,
      };
    },
  );

  const convertedRecordFilterGroups: RecordFilterGroup[] =
    recordFilterGroups.map((recordFilterGroup) => ({
      id: recordFilterGroup.id,
      parentRecordFilterGroupId:
        recordFilterGroup.parentRecordFilterGroupId ?? undefined,
      logicalOperator:
        recordFilterGroup.logicalOperator as RecordFilterGroupLogicalOperator,
    }));

  return computeRecordGqlOperationFilter({
    fieldMetadataItems: Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined),
    recordFilters: convertedRecordFilters,
    recordFilterGroups: convertedRecordFilterGroups,
    filterValueDependencies: {
      timeZone: userTimezone,
      currentWorkspaceMemberId,
    },
  });
};

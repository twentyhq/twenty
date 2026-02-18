import {
  type ChartFilter,
  type CompositeFieldSubFieldName,
  type FilterableAndTSVectorFieldType,
  type PartialFieldMetadataItem,
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
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ConvertChartFilterToGqlOperationFilterParams = {
  filter: ChartFilter | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  userTimezone: string;
};

export const convertChartFilterToGqlOperationFilter = ({
  filter,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  userTimezone,
}: ConvertChartFilterToGqlOperationFilterParams): ObjectRecordFilter => {
  if (!isDefined(filter)) {
    return {};
  }

  const recordFilters = filter.recordFilters ?? [];
  const recordFilterGroups = filter.recordFilterGroups ?? [];

  if (recordFilters.length === 0 && recordFilterGroups.length === 0) {
    return {};
  }

  const fieldIds = flatObjectMetadata.fieldIds ?? [];
  const fields: PartialFieldMetadataItem[] = fieldIds
    .map((fieldId: string) => {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(field)) {
        return null;
      }

      return {
        id: field.id,
        name: field.name,
        type: field.type,
        label: field.label,
        options: field.options?.map((opt) => ({
          id: opt.id ?? '',
          label: opt.label,
          value: opt.value,
          color: 'color' in opt ? opt.color : undefined,
          position: opt.position,
        })),
      };
    })
    .filter(isDefined);

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
    fields,
    recordFilters: convertedRecordFilters,
    recordFilterGroups: convertedRecordFilterGroups,
    filterValueDependencies: {
      timeZone: userTimezone,
    },
  });
};

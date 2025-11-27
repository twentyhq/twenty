import { type CompositeType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type ColumnNameProcessor,
  processFieldMetadataForColumnNameMapping,
} from 'src/engine/twenty-orm/utils/process-field-metadata-for-column-name-mapping.util';

export function getColumnNameToFieldMetadataIdMap(
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) {
  const columnNameToFieldMetadataIdMap: Record<string, string> = {};

  const processor: ColumnNameProcessor = {
    processCompositeField: ({
      fieldMetadataId,
      fieldMetadata,
      compositeType,
    }: {
      fieldMetadataId: string;
      fieldMetadata: FlatFieldMetadata;
      compositeType: CompositeType;
    }) => {
      compositeType.properties.forEach((compositeProperty) => {
        const columnName = computeCompositeColumnName(
          fieldMetadata.name,
          compositeProperty,
        );

        columnNameToFieldMetadataIdMap[columnName] = fieldMetadataId;
      });
    },
    processRelationField: ({
      fieldMetadataId,
      joinColumnName,
      connectFieldName,
    }: {
      fieldMetadataId: string;
      joinColumnName: string;
      connectFieldName?: string;
    }) => {
      columnNameToFieldMetadataIdMap[joinColumnName] = fieldMetadataId;
      if (isDefined(connectFieldName)) {
        columnNameToFieldMetadataIdMap[connectFieldName] = fieldMetadataId;
      }
    },
    processSimpleField: ({
      fieldMetadataId,
      columnName,
    }: {
      fieldMetadataId: string;
      columnName: string;
    }) => {
      columnNameToFieldMetadataIdMap[columnName] = fieldMetadataId;
    },
  };

  processFieldMetadataForColumnNameMapping(
    flatObjectMetadata,
    flatFieldMetadataMaps,
    processor,
  );

  return columnNameToFieldMetadataIdMap;
}

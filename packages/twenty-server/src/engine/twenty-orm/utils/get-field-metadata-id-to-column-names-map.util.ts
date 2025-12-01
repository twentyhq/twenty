import { type CompositeType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import {
  type ColumnNameProcessor,
  processFieldMetadataForColumnNameMapping,
} from 'src/engine/twenty-orm/utils/process-field-metadata-for-column-name-mapping.util';

export function getFieldMetadataIdToColumnNamesMap(
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) {
  const fieldMetadataToColumnNamesMap = new Map<string, string[]>();

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

        const existingColumns =
          fieldMetadataToColumnNamesMap.get(fieldMetadataId) ?? [];

        fieldMetadataToColumnNamesMap.set(fieldMetadataId, [
          ...existingColumns,
          columnName,
        ]);
      });
    },
    processRelationField: ({
      fieldMetadataId,
      joinColumnName,
    }: {
      fieldMetadataId: string;
      joinColumnName: string;
    }) => {
      fieldMetadataToColumnNamesMap.set(fieldMetadataId, [joinColumnName]);
    },
    processSimpleField: ({
      fieldMetadataId,
      columnName,
    }: {
      fieldMetadataId: string;
      fieldMetadata: FlatFieldMetadata;
      columnName: string;
    }) => {
      fieldMetadataToColumnNamesMap.set(fieldMetadataId, [columnName]);
    },
  };

  processFieldMetadataForColumnNameMapping(
    flatObjectMetadata,
    flatFieldMetadataMaps,
    processor,
  );

  return fieldMetadataToColumnNamesMap;
}

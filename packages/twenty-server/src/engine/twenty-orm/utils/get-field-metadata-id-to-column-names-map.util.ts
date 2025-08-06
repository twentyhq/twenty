import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  ColumnNameProcessor,
  processFieldMetadataForColumnNameMapping,
} from 'src/engine/twenty-orm/utils/process-field-metadata-for-column-name-mapping.util';

export function getFieldMetadataIdToColumnNamesMap(
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) {
  const fieldMetadataToColumnNamesMap = new Map<string, string[]>();

  const processor: ColumnNameProcessor = {
    processCompositeField: ({
      fieldMetadataId,
      fieldMetadata,
      compositeType,
    }: {
      fieldMetadataId: string;
      fieldMetadata: FieldMetadataEntity;
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
      fieldMetadata: FieldMetadataEntity;
      columnName: string;
    }) => {
      fieldMetadataToColumnNamesMap.set(fieldMetadataId, [columnName]);
    },
  };

  processFieldMetadataForColumnNameMapping(
    objectMetadataItemWithFieldMaps,
    processor,
  );

  return fieldMetadataToColumnNamesMap;
}

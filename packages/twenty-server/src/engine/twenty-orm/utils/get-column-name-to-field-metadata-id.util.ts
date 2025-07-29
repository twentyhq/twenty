import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  ColumnNameProcessor,
  processFieldMetadata,
} from 'src/engine/twenty-orm/utils/process-field-metadata.util';

export function getColumnNameToFieldMetadataIdMap(
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) {
  const columnNameToFieldMetadataIdMap: Record<string, string> = {};

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

        columnNameToFieldMetadataIdMap[columnName] = fieldMetadataId;
      });
    },
    processRelationField: ({
      fieldMetadataId,
      columnName,
    }: {
      fieldMetadataId: string;
      columnName: string;
    }) => {
      columnNameToFieldMetadataIdMap[columnName] = fieldMetadataId;
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

  processFieldMetadata(objectMetadataItemWithFieldMaps, processor);

  return columnNameToFieldMetadataIdMap;
}

import { isDefined } from 'twenty-shared/utils';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  ColumnNameProcessor,
  processFieldMetadataForColumnNameMapping,
} from 'src/engine/twenty-orm/utils/process-field-metadata-for-column-name-mapping.util';

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
    objectMetadataItemWithFieldMaps,
    processor,
  );

  return columnNameToFieldMetadataIdMap;
}

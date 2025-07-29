import { FieldMetadataRelationSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export function getFieldMetadataIdToColumnNamesMap(
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) {
  const fieldMetadataToColumnNamesMap = new Map<string, string[]>();

  for (const [fieldMetadataId, fieldMetadata] of Object.entries(
    objectMetadataItemWithFieldMaps.fieldsById,
  )) {
    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

      if (!compositeType) {
        throw new InternalServerError(
          `Composite type not found for field metadata type ${fieldMetadata.type}`,
        );
      }

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
    } else {
      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        const fieldMetadataSettings =
          fieldMetadata.settings as FieldMetadataRelationSettings;

        if (fieldMetadataSettings?.relationType === RelationType.ONE_TO_MANY) {
          continue;
        }
        const columnName = (
          fieldMetadataSettings as FieldMetadataRelationSettings
        )?.joinColumnName;

        if (!columnName) {
          throw new InternalServerError(
            `Join column name is required for relation field metadata ${fieldMetadata.name}`,
          );
        }

        fieldMetadataToColumnNamesMap.set(fieldMetadataId, [columnName]); // TODO test
      } else {
        const columnName = computeColumnName(fieldMetadata);

        fieldMetadataToColumnNamesMap.set(fieldMetadataId, [columnName]);
      }
    }
  }

  return fieldMetadataToColumnNamesMap;
}

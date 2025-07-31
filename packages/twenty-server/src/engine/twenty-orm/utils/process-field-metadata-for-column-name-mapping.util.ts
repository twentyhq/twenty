import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';
import { FieldMetadataRelationSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export type ColumnNameProcessor = {
  processCompositeField: ({
    fieldMetadataId,
    fieldMetadata,
    compositeType,
  }: {
    fieldMetadataId: string;
    fieldMetadata: FieldMetadataEntity;
    compositeType: CompositeType;
  }) => void;
  processRelationField: ({
    fieldMetadataId,
    fieldMetadata,
    columnName,
  }: {
    fieldMetadataId: string;
    fieldMetadata: FieldMetadataEntity;
    columnName: string;
  }) => void;
  processSimpleField: ({
    fieldMetadataId,
    fieldMetadata,
    columnName,
  }: {
    fieldMetadataId: string;
    fieldMetadata: FieldMetadataEntity;
    columnName: string;
  }) => void;
};

export function processFieldMetadataForColumnNameMapping(
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  processor: ColumnNameProcessor,
) {
  for (const [fieldMetadataId, fieldMetadata] of Object.entries(
    objectMetadataItemWithFieldMaps.fieldsById,
  )) {
    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

      if (!compositeType) {
        throw new PermissionsException(
          `Composite type not found for field metadata type ${fieldMetadata.type}`,
          PermissionsExceptionCode.COMPOSITE_TYPE_NOT_FOUND,
        );
      }

      processor.processCompositeField({
        fieldMetadataId,
        fieldMetadata,
        compositeType,
      });
    } else {
      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        const fieldMetadataSettings =
          fieldMetadata.settings as FieldMetadataRelationSettings;

        if (fieldMetadataSettings?.relationType === RelationType.ONE_TO_MANY) {
          continue;
        }
        const columnName = fieldMetadataSettings?.joinColumnName;

        if (!columnName) {
          throw new PermissionsException(
            `Join column name is required for relation field metadata ${fieldMetadata.name}`,
            PermissionsExceptionCode.JOIN_COLUMN_NAME_REQUIRED,
          );
        }
        processor.processRelationField({
          fieldMetadataId,
          fieldMetadata,
          columnName,
        });
      } else {
        const columnName = computeColumnName(fieldMetadata);

        processor.processSimpleField({
          fieldMetadataId,
          fieldMetadata,
          columnName,
        });
      }
    }
  }
}

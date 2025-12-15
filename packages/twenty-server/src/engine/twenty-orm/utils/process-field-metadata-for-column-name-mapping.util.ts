import {
  type CompositeType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

export type ColumnNameProcessor = {
  processCompositeField: ({
    fieldMetadataId,
    fieldMetadata,
    compositeType,
  }: {
    fieldMetadataId: string;
    fieldMetadata: FlatFieldMetadata;
    compositeType: CompositeType;
  }) => void;
  processRelationField: ({
    fieldMetadataId,
    fieldMetadata,
    joinColumnName,
    connectFieldName,
  }: {
    fieldMetadataId: string;
    fieldMetadata: FlatFieldMetadata;
    joinColumnName: string;
    connectFieldName?: string;
  }) => void;
  processSimpleField: ({
    fieldMetadataId,
    fieldMetadata,
    columnName,
  }: {
    fieldMetadataId: string;
    fieldMetadata: FlatFieldMetadata;
    columnName: string;
  }) => void;
};

export function processFieldMetadataForColumnNameMapping(
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  processor: ColumnNameProcessor,
) {
  for (const fieldMetadataId of flatObjectMetadata.fieldMetadataIds) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldMetadataId,
    });

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
      if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
        const fieldMetadataSettings = fieldMetadata.settings;

        if (fieldMetadataSettings?.relationType === RelationType.ONE_TO_MANY) {
          continue;
        }

        const { joinColumnName, fieldMetadataName } =
          extractGraphQLRelationFieldNames(fieldMetadata);

        processor.processRelationField({
          fieldMetadataId,
          fieldMetadata,
          joinColumnName,
          connectFieldName: fieldMetadataName,
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

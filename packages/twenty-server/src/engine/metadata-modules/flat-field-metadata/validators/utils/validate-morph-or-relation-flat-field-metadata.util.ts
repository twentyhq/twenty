import { msg } from '@lingui/core/macro';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { validateMorphOrRelationFlatFieldJoinColumName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-join-column-name.util';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';

export const validateMorphOrRelationFlatFieldMetadata = ({
  flatEntityToValidate: flatFieldMetadataToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
  updates,
  remainingFlatEntityMapsToValidate,
  buildOptions,
}: FlatFieldMetadataTypeValidationArgs<MorphOrRelationFieldMetadataType>): FlatFieldMetadataValidationError[] => {
  const { relationTargetFieldMetadataId, relationTargetObjectMetadataId } =
    flatFieldMetadataToValidate;

  const uuidsValidation = [
    relationTargetObjectMetadataId,
    relationTargetFieldMetadataId,
  ].flatMap<FlatFieldMetadataValidationError>((id) =>
    isValidUuid(id)
      ? []
      : {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Invalid uuid ${id}`,
          userFriendlyMessage: msg`Invalid uuid ${id}`,
          value: id,
        },
  );

  if (uuidsValidation.length > 0) {
    return uuidsValidation;
  }

  const errors: FlatFieldMetadataValidationError[] = [];

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const targetFlatFieldMetadata =
    remainingFlatEntityMapsToValidate?.byId[relationTargetFieldMetadataId] ??
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  if (!isDefined(targetFlatObjectMetadata)) {
    errors.push({
      code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      message: 'Relation target object metadata not found',
      userFriendlyMessage: msg`Object targeted by the relation not found`,
    });

    return errors;
  }

  if (!isDefined(targetFlatFieldMetadata)) {
    errors.push({
      code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      message: isDefined(remainingFlatEntityMapsToValidate)
        ? 'Relation field target metadata not found in both existing and about to be created field metadatas'
        : 'Relation field target metadata not found',
      userFriendlyMessage: msg`Relation field target metadata not found`,
    });
  } else {
    if (!isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata)) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message:
          'A relation field can only target a MORPH_RELATION or another RELATION field',
        userFriendlyMessage: msg`Invalid relation field target`,
      });
    } else {
      if (
        targetFlatFieldMetadata.objectMetadataId !==
        flatFieldMetadataToValidate.relationTargetObjectMetadataId
      ) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Target field metadata does not belong to the expected target object',
          userFriendlyMessage: msg`Target relation field does not belong to the expected object`,
        });
      }

      if (
        targetFlatFieldMetadata.relationTargetObjectMetadataId !==
        flatFieldMetadataToValidate.objectMetadataId
      ) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Target field metadata does not point back to the source object',
          userFriendlyMessage: msg`Target relation field does not reference the source object`,
        });
      }

      if (
        targetFlatFieldMetadata.relationTargetFieldMetadataId !==
        flatFieldMetadataToValidate.id
      ) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Target field metadata does not point back to the source field',
          userFriendlyMessage: msg`Target relation field does not reference this field`,
        });
      }
    }
  }

  if (
    !isDefined(updates) ||
    isDefined(
      findFlatEntityPropertyUpdate({
        flatEntityUpdates: updates,
        property: 'settings',
      }),
    )
  )
    errors.push(
      ...validateMorphOrRelationFlatFieldJoinColumName({
        buildOptions,
        flatFieldMetadata: flatFieldMetadataToValidate,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        },
      }),
    );

  return errors;
};

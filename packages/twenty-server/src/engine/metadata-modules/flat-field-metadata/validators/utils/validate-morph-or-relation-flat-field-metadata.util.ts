import { t } from '@lingui/core/macro';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateMorphOrRelationFlatFieldMetadata = async ({
  dependencyOptimisticFlatEntityMaps: { flatObjectMetadataMaps },
  flatFieldMetadataToValidate,
  optimisticFlatFieldMetadataMaps,
  otherFlatFieldMetadataMapsToValidate,
}: ValidateOneFieldMetadataArgs<MorphOrRelationFieldMetadataType>): Promise<
  FlatFieldMetadataValidationError[]
> => {
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
          userFriendlyMessage: t`Invalid uuid ${id}`,
          value: id,
        },
  );

  if (uuidsValidation.length > 0) {
    return uuidsValidation;
  }

  const errors: FlatFieldMetadataValidationError[] = [];

  const targetRelationFlatObjectMetadata =
    flatObjectMetadataMaps?.byId[relationTargetObjectMetadataId];

  if (!isDefined(targetRelationFlatObjectMetadata)) {
    errors.push({
      code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      message: 'Relation target object metadata not found',
      userFriendlyMessage: t`Object targeted by the relation not found`,
      value: relationTargetObjectMetadataId,
    });
  }

  const targetRelationFlatFieldMetadata =
    otherFlatFieldMetadataMapsToValidate?.byId[relationTargetFieldMetadataId] ??
    optimisticFlatFieldMetadataMaps?.byId[relationTargetFieldMetadataId];

  if (
    isDefined(targetRelationFlatObjectMetadata) &&
    !isDefined(targetRelationFlatFieldMetadata)
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      message: isDefined(otherFlatFieldMetadataMapsToValidate)
        ? 'Relation field target metadata not found in both existing and about to be created field metadatas'
        : 'Relation field target metadata not found',
      userFriendlyMessage: t`Relation field target metadata not found`,
      value: relationTargetFieldMetadataId,
    });
  }

  return errors;
};

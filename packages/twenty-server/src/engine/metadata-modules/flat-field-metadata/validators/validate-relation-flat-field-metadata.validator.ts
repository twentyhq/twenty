import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { mergeTwoFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/merge-two-flat-object-metadatas.util';

// Remark: This is duplicated with api metadata transpilers exceptions handlers
// We might wanna have an NotValidatedFlatFieldMetadata and NotValidatedFlatObjectMetadata, in order to avoid
export const validateRelationFlatFieldMetadata = async ({
  existingFlatObjectMetadatas,
  flatFieldMetadataToValidate: {
    relationTargetFieldMetadataId,
    relationTargetObjectMetadataId,
  },
  othersFlatObjectMetadataToValidate,
}: ValidateOneFieldMetadataArgs<FieldMetadataType.RELATION>): Promise<
  FailedFlatFieldMetadataValidationExceptions[]
> => {
  const uuidsValidation = [
    relationTargetObjectMetadataId,
    relationTargetFieldMetadataId,
  ].flatMap<FieldMetadataException>((id) =>
    isValidUuid(id)
      ? []
      : new FieldMetadataException(
          `Invalid uuid ${id}`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        ),
  );

  if (uuidsValidation.length > 0) {
    return uuidsValidation;
  }

  const errors: FailedFlatFieldMetadataValidationExceptions[] = [];
  const allFlatObjectMetadata = isDefined(othersFlatObjectMetadataToValidate)
    ? mergeTwoFlatObjectMetadatas({
        destFlatObjectMetadatas: existingFlatObjectMetadatas,
        toMergeFlatObjectMetadatas: othersFlatObjectMetadataToValidate,
      })
    : existingFlatObjectMetadatas;

  const targetRelationFlatObjectMetadata = allFlatObjectMetadata.find(
    (flatObjectMetadata) =>
      flatObjectMetadata.id === relationTargetObjectMetadataId,
  );

  if (!isDefined(targetRelationFlatObjectMetadata)) {
    errors.push(
      new FieldMetadataException(
        isDefined(othersFlatObjectMetadataToValidate)
          ? 'Relation target object metadata not found in both existing and about to be created object metadatas'
          : 'Relation target object metadata not found',
        FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      ),
    );
  }

  const targetRelationFlatFieldMetadata =
    targetRelationFlatObjectMetadata?.flatFieldMetadatas.find(
      (flatFieldMetadata) =>
        flatFieldMetadata.id === relationTargetFieldMetadataId,
    );

  if (!isDefined(targetRelationFlatFieldMetadata)) {
    errors.push(
      new FieldMetadataException(
        isDefined(othersFlatObjectMetadataToValidate)
          ? 'Relation field target metadata not found in both existing and about to be created field metadatas'
          : 'Relation field target metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
    );
  }

  return errors;
};

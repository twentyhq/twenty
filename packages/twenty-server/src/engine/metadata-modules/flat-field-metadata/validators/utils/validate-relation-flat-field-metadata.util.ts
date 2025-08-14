import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { type FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';

export const validateRelationFlatFieldMetadata = async ({
  existingFlatObjectMetadataMaps,
  flatFieldMetadataToValidate: {
    relationTargetFieldMetadataId,
    relationTargetObjectMetadataId,
  },
  otherFlatObjectMetadataMapsToValidate,
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

  const targetRelationFlatObjectMetadata =
    otherFlatObjectMetadataMapsToValidate?.byId[
      relationTargetObjectMetadataId
    ] ?? existingFlatObjectMetadataMaps.byId[relationTargetObjectMetadataId];

  if (!isDefined(targetRelationFlatObjectMetadata)) {
    errors.push(
      new FieldMetadataException(
        isDefined(otherFlatObjectMetadataMapsToValidate)
          ? 'Relation target object metadata not found in both existing and about to be created object metadatas'
          : 'Relation target object metadata not found',
        FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      ),
    );
  }

  const targetRelationFlatFieldMetadata =
    targetRelationFlatObjectMetadata?.fieldsById[relationTargetFieldMetadataId];

  if (
    isDefined(targetRelationFlatObjectMetadata) &&
    !isDefined(targetRelationFlatFieldMetadata)
  ) {
    errors.push(
      new FieldMetadataException(
        isDefined(otherFlatObjectMetadataMapsToValidate)
          ? 'Relation field target metadata not found in both existing and about to be created field metadatas'
          : 'Relation field target metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
    );
  }

  return errors;
};

import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { t } from '@lingui/core/macro';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import {
  FailedFlatFieldMetadataValidation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { FlatFieldMetadataIdObjectIdAndName } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-id-object-id-and-name.type';

export const validateRelationFlatFieldMetadata = async ({
  existingFlatObjectMetadataMaps,
  flatFieldMetadataToValidate,
  otherFlatObjectMetadataMapsToValidate,
}: ValidateOneFieldMetadataArgs<FieldMetadataType.RELATION>): Promise<
  FailedFlatFieldMetadataValidation[]
> => {
  const {
    relationTargetFieldMetadataId,
    relationTargetObjectMetadataId,
    objectMetadataId,
  } = flatFieldMetadataToValidate;
  const FlatFieldMetadataIdObjectIdAndName: FlatFieldMetadataIdObjectIdAndName =
    {
      id: flatFieldMetadataToValidate.id,
      name: flatFieldMetadataToValidate.name,
      objectMetadataId,
    };
  const uuidsValidation = [
    relationTargetObjectMetadataId,
    relationTargetFieldMetadataId,
  ].flatMap<FailedFlatFieldMetadataValidation>((id) =>
    isValidUuid(id)
      ? []
      : {
          error: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Invalid uuid ${id}`,
          userFriendlyMessage: t`Invalid uuid ${id}`,
          value: id,
          ...FlatFieldMetadataIdObjectIdAndName,
        },
  );

  if (uuidsValidation.length > 0) {
    return uuidsValidation;
  }

  const errors: FailedFlatFieldMetadataValidation[] = [];

  const targetRelationFlatObjectMetadata =
    otherFlatObjectMetadataMapsToValidate?.byId[
      relationTargetObjectMetadataId
    ] ?? existingFlatObjectMetadataMaps.byId[relationTargetObjectMetadataId];

  if (!isDefined(targetRelationFlatObjectMetadata)) {
    errors.push({
      error: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      message: isDefined(otherFlatObjectMetadataMapsToValidate)
        ? 'Relation target object metadata not found in both existing and about to be created object metadatas'
        : 'Relation target object metadata not found',
      userFriendlyMessage: t`Object targetted by the relation not found`,
      value: relationTargetObjectMetadataId,
      ...FlatFieldMetadataIdObjectIdAndName,
    });
  }

  const targetRelationFlatFieldMetadata =
    targetRelationFlatObjectMetadata?.fieldsById[relationTargetFieldMetadataId];

  if (
    isDefined(targetRelationFlatObjectMetadata) &&
    !isDefined(targetRelationFlatFieldMetadata)
  ) {
    errors.push({
      error: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      message: isDefined(otherFlatObjectMetadataMapsToValidate)
        ? 'Relation field target metadata not found in both existing and about to be created field metadatas'
        : 'Relation field target metadata not found',
      userFriendlyMessage: t`Relation field target metadata not found`,
      value: relationTargetFieldMetadataId,
      ...FlatFieldMetadataIdObjectIdAndName,
    });
  }

  return errors;
};

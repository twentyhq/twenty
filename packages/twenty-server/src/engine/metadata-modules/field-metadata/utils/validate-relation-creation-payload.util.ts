import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { RelationCreationPayloadValidation } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';

export const validateRelationCreationPayloadOrThrow = async (
  relationCreationPayload: RelationCreationPayloadValidation,
) => {
  try {
    const relationCreationPayloadInstance = plainToInstance(
      RelationCreationPayloadValidation,
      relationCreationPayload,
    );

    await validateOrReject(relationCreationPayloadInstance);
  } catch (error) {
    const errorMessages = Array.isArray(error)
      ? error
          .map((err: ValidationError) => Object.values(err.constraints ?? {}))
          .flat()
          .join(', ')
      : error.message;

    throw new FieldMetadataException(
      `Relation creation payload is invalid: ${errorMessages}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
};

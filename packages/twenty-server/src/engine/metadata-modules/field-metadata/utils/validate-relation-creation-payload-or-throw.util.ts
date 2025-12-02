import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsString,
  IsUUID,
  validateOrReject,
  type ValidationError,
} from 'class-validator';
import { RelationType } from 'twenty-shared/types';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

class RelationCreationPayloadValidation {
  @IsUUID()
  targetObjectMetadataId?: string;

  @IsString()
  targetFieldLabel: string;

  @IsString()
  targetFieldIcon: string;

  @IsEnum(RelationType)
  type: RelationType;
}

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

import { QueryFailedError } from 'typeorm';

import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const objectMetadataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof InvalidMetadataException) {
    throw new UserInputError(error);
  }

  if (error instanceof ObjectMetadataException) {
    switch (error.code) {
      case ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
        throw new NotFoundError(error);
      case ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT:
        throw new UserInputError(error);
      case ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED:
        throw new ForbiddenError(error);
      case ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS:
        throw new ConflictError(error);
      case ObjectMetadataExceptionCode.INVALID_ORM_OUTPUT:
        throw new InternalServerError(error);
      case ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD:
        throw error;
      default: {
        const _exhaustiveCheck: never = error.code;

        throw error;
      }
    }
  }

  if (error instanceof QueryFailedError) {
    if (
      error.message.includes('duplicate key value violates unique constraint')
    ) {
      const constraintMatch = error.message.match(/"([^"]+)"/);
      const constraintName = constraintMatch?.[1];

      if (
        constraintName ===
        'IDX_FIELD_METADATA_NAME_OBJMID_WORKSPACE_ID_EXCEPT_MORPH_UNIQUE'
      ) {
        throw new ObjectMetadataException(
          'Field name conflicts with a system field. Please choose a different name.',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          {
            userFriendlyMessage:
              'Field name conflicts with a system field. Please choose a different name.',
          },
        );
      }
    }
  }

  throw error;
};

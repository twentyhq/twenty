import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const fieldMetadataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof InvalidMetadataException) {
    throw new UserInputError(error.message);
  }

  if (error instanceof FieldMetadataException) {
    switch (error.code) {
      case FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND:
        throw new NotFoundError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case FieldMetadataExceptionCode.INVALID_FIELD_INPUT:
        throw new UserInputError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED:
        throw new ForbiddenError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS:
        throw new ConflictError(error.message, {
          userFriendlyMessage: error.userFriendlyMessage,
        });
      case FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      case FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR:
      case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_NOT_ENABLED:
      case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED:
      case FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND:
        throw error;
      default: {
        const _exhaustiveCheck: never = error.code;

        throw error;
      }
    }
  }

  throw error;
};

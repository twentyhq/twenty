import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

export const fieldMetadataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof FieldMetadataException) {
    switch (error.code) {
      case FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND:
        throw new NotFoundError(error.message);
      case FieldMetadataExceptionCode.INVALID_FIELD_INPUT:
        throw new UserInputError(error.message);
      case FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED:
        throw new ForbiddenError(error.message);
      case FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS:
        throw new ConflictError(error.message);
      case FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      case FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};

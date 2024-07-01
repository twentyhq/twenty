import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  UserInputError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from 'src/engine/utils/graphql-errors.util';

export const objectMetadataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof ObjectMetadataException) {
    switch (error.code) {
      case ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT:
        throw new UserInputError(error.message);
      case ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED:
        throw new ForbiddenError(error.message);
      case ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS:
        throw new ConflictError(error.message);
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};

import {
  FunctionMetadataException,
  FunctionMetadataExceptionCode,
} from 'src/engine/metadata-modules/function-metadata/function-metadata.exception';
import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from 'src/engine/utils/graphql-errors.util';

export const functionGraphQLApiExceptionHandler = (error: any) => {
  if (error instanceof FunctionMetadataException) {
    switch (error.code) {
      case FunctionMetadataExceptionCode.FUNCTION_NOT_FOUND:
        throw new NotFoundError(error.message);
      case FunctionMetadataExceptionCode.FUNCTION_ALREADY_EXIST:
        throw new ConflictError(error.message);
      case FunctionMetadataExceptionCode.FUNCTION_NOT_READY:
        throw new ForbiddenError(error.message);
      default:
        throw new InternalServerError(error.message);
    }
  }
  throw error;
};

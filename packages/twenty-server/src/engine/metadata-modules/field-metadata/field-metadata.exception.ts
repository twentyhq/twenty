import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/utils/graphql-errors.util';
import { CustomError } from 'src/utils/custom-error';

export class FieldMetadataException extends CustomError {
  code: FieldMetadataExceptionCode;
  constructor(message: string, code: FieldMetadataExceptionCode) {
    super(message, code);
  }
}

export enum FieldMetadataExceptionCode {
  FIELD_METADATA_NOT_FOUND = 'FIELD_METADATA_NOT_FOUND',
  INVALID_FIELD_INPUT = 'INVALID_FIELD_INPUT',
  FIELD_MUTATION_NOT_ALLOWED = 'FIELD_MUTATION_NOT_ALLOWED',
  FIELD_ALREADY_EXISTS = 'FIELD_ALREADY_EXISTS',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export const fieldMetadataExceptionHandler = (error: Error) => {
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

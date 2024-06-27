import {
  NotFoundError,
  UserInputError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
} from 'src/engine/utils/graphql-errors.util';
import { CustomError } from 'src/utils/custom-error';

export class ObjectMetadataException extends CustomError {
  code: ObjectMetadataExceptionCode;
  constructor(message: string, code: ObjectMetadataExceptionCode) {
    super(message, code);
  }
}

export enum ObjectMetadataExceptionCode {
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  INVALID_OBJECT_INPUT = 'INVALID_OBJECT_INPUT',
  OBJECT_MUTATION_NOT_ALLOWED = 'OBJECT_MUTATION_NOT_ALLOWED',
  OBJECT_ALREADY_EXISTS = 'OBJECT_ALREADY_EXISTS',
}

export const objectMetadataExceptionHandler = (error: Error) => {
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

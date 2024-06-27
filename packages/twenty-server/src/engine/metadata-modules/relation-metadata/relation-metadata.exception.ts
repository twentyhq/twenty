import {
  NotFoundError,
  UserInputError,
  ConflictError,
  InternalServerError,
} from 'src/engine/utils/graphql-errors.util';
import { CustomError } from 'src/utils/custom-error';

export class RelationMetadataException extends CustomError {
  code: RelationMetadataExceptionCode;
  constructor(message: string, code: RelationMetadataExceptionCode) {
    super(message, code);
  }
}

export enum RelationMetadataExceptionCode {
  RELATION_METADATA_NOT_FOUND = 'RELATION_METADATA_NOT_FOUND',
  INVALID_RELATION_INPUT = 'INVALID_RELATION_INPUT',
  RELATION_ALREADY_EXISTS = 'RELATION_ALREADY_EXISTS',
  FOREIGN_KEY_NOT_FOUND = 'FOREIGN_KEY_NOT_FOUND',
}

export const relationMetadataExceptionHandler = (error: Error) => {
  if (error instanceof RelationMetadataException) {
    switch (error.code) {
      case RelationMetadataExceptionCode.RELATION_METADATA_NOT_FOUND:
        throw new NotFoundError(error.message);
      case RelationMetadataExceptionCode.INVALID_RELATION_INPUT:
        throw new UserInputError(error.message);
      case RelationMetadataExceptionCode.RELATION_ALREADY_EXISTS:
        throw new ConflictError(error.message);
      case RelationMetadataExceptionCode.FOREIGN_KEY_NOT_FOUND:
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};

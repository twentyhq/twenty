import {
  ConflictError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RelationMetadataException,
  RelationMetadataExceptionCode,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const relationMetadataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof InvalidMetadataException) {
    throw new UserInputError(error.message);
  }

  if (error instanceof RelationMetadataException) {
    switch (error.code) {
      case RelationMetadataExceptionCode.INVALID_RELATION_INPUT:
        throw new UserInputError(error.message);
      case RelationMetadataExceptionCode.RELATION_ALREADY_EXISTS:
        throw new ConflictError(error.message);
      case RelationMetadataExceptionCode.FOREIGN_KEY_NOT_FOUND:
      case RelationMetadataExceptionCode.RELATION_METADATA_NOT_FOUND:
        throw error;
      default: {
        const _exhaustiveCheck: never = error.code;

        throw error;
      }
    }
  }

  throw error;
};

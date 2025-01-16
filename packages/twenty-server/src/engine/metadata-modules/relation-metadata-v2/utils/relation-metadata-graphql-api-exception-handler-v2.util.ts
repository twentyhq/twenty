import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RelationMetadataV2Exception,
  RelationMetadataV2ExceptionCode,
} from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.exception';

export const relationMetadataGraphqlApiExceptionHandlerV2 = (error: Error) => {
  if (error instanceof RelationMetadataV2Exception) {
    switch (error.code) {
      case RelationMetadataV2ExceptionCode.RELATION_METADATA_NOT_FOUND:
        throw new NotFoundError(error.message);
      case RelationMetadataV2ExceptionCode.INVALID_RELATION_INPUT:
        throw new UserInputError(error.message);
      case RelationMetadataV2ExceptionCode.RELATION_ALREADY_EXISTS:
        throw new ConflictError(error.message);
      case RelationMetadataV2ExceptionCode.FOREIGN_KEY_NOT_FOUND:
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};

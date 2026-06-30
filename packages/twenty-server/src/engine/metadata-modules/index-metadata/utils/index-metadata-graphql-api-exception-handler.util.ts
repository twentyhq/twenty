import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderGraphqlApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-builder-graphql-api-exception-handler.util';

export const indexMetadataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    return workspaceMigrationBuilderGraphqlApiExceptionHandler(error);
  }

  if (error instanceof IndexMetadataException) {
    switch (error.code) {
      case IndexMetadataExceptionCode.INDEX_OBJECT_NOT_FOUND:
      case IndexMetadataExceptionCode.INDEX_NOT_FOUND:
        throw new NotFoundError(error);
      case IndexMetadataExceptionCode.INDEX_FIELDS_REQUIRED:
      case IndexMetadataExceptionCode.DUPLICATE_INDEX_FIELDS:
      case IndexMetadataExceptionCode.INDEX_FIELD_NOT_FOUND_ON_OBJECT:
      case IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD:
      case IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD:
      case IndexMetadataExceptionCode.INDEX_TYPE_NOT_SUPPORTED_FOR_FIELD_TYPE:
      case IndexMetadataExceptionCode.DUPLICATE_UNIQUE_INDEX:
        throw new UserInputError(error);
      case IndexMetadataExceptionCode.CANNOT_DELETE_SYSTEM_INDEX:
        throw new ForbiddenError(error);
      case IndexMetadataExceptionCode.CUSTOM_INDEX_LIMIT_REACHED:
        throw new ConflictError(error);
      case IndexMetadataExceptionCode.INDEX_CREATION_FAILED:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};

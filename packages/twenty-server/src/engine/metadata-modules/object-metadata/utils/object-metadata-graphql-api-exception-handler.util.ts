import { type I18n } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-builder-exception-formatter';

export const objectMetadataGraphqlApiExceptionHandler = (
  error: Error,
  i18n: I18n,
) => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    workspaceMigrationBuilderExceptionFormatter(error, i18n);
  }

  if (error instanceof InvalidMetadataException) {
    throw new UserInputError(error);
  }

  if (error instanceof ObjectMetadataException) {
    switch (error.code) {
      case ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
        throw new NotFoundError(error);
      case ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT:
        throw new UserInputError(error);
      case ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED:
      case ObjectMetadataExceptionCode.NAME_CONFLICT:
        throw new ForbiddenError(error);
      case ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS:
        throw new ConflictError(error);
      case ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR:
      case ObjectMetadataExceptionCode.INVALID_ORM_OUTPUT:
        throw new InternalServerError(error);
      case ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD:
      case ObjectMetadataExceptionCode.APPLICATION_NOT_FOUND:
        throw error;
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};

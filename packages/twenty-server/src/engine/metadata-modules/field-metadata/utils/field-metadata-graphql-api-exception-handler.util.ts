import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderGraphqlApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-builder-graphql-api-exception-handler.util';
import { workspaceMigrationRunnerExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-runner-exception-formatter';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const fieldMetadataGraphqlApiExceptionHandler = (error: unknown) => {
  if (error instanceof WorkspaceMigrationRunnerException) {
    workspaceMigrationRunnerExceptionFormatter(error);
  }

  if (error instanceof WorkspaceMigrationBuilderException) {
    return workspaceMigrationBuilderGraphqlApiExceptionHandler(error);
  }

  if (error instanceof InvalidMetadataException) {
    throw new UserInputError(error);
  }

  if (error instanceof FieldMetadataException) {
    switch (error.code) {
      case FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND:
        throw new NotFoundError(error);
      case FieldMetadataExceptionCode.INVALID_FIELD_INPUT:
        throw new UserInputError(error);
      case FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED:
        throw new ForbiddenError(error);
      case FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS:
        throw new ConflictError(error);
      case FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      case FieldMetadataExceptionCode.APPLICATION_NOT_FOUND:
      case FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR:
      case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_NOT_ENABLED:
      case FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED:
      case FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION:
      case FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND:
      case FieldMetadataExceptionCode.RESERVED_KEYWORD:
      case FieldMetadataExceptionCode.NOT_AVAILABLE:
      case FieldMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL:
        throw error;
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};

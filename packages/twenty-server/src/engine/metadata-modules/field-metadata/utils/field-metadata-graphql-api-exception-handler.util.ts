import { type I18n } from '@lingui/core';
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
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { workspaceMigrationBuilderExceptionV2Formatter } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-exception-v2-formatter';

export const fieldMetadataGraphqlApiExceptionHandler = (
  error: Error,
  i18n: I18n,
) => {
  if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
    workspaceMigrationBuilderExceptionV2Formatter(error, i18n);
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

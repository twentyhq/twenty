import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  INVALID_INPUT_USER_FRIENDLY_MESSAGE,
  TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE,
} from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-messages.constants';
import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum TwentyOrmExceptionCode {
  WORKSPACE_SCHEMA_NOT_FOUND = 'WORKSPACE_SCHEMA_NOT_FOUND',
  ROLES_PERMISSIONS_VERSION_NOT_FOUND = 'ROLES_PERMISSIONS_VERSION_NOT_FOUND',
  FEATURE_FLAG_MAP_VERSION_NOT_FOUND = 'FEATURE_FLAG_MAP_VERSION_NOT_FOUND',
  USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND = 'USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND',
  API_KEY_ROLE_MAP_VERSION_NOT_FOUND = 'API_KEY_ROLE_MAP_VERSION_NOT_FOUND',
  MALFORMED_METADATA = 'MALFORMED_METADATA',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  CONNECT_RECORD_NOT_FOUND = 'CONNECT_RECORD_NOT_FOUND',
  CONNECT_NOT_ALLOWED = 'CONNECT_NOT_ALLOWED',
  CONNECT_UNIQUE_CONSTRAINT_ERROR = 'CONNECT_UNIQUE_CONSTRAINT_ERROR',
  MISSING_MAIN_ALIAS_TARGET = 'MISSING_MAIN_ALIAS_TARGET',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  ENUM_TYPE_NAME_NOT_FOUND = 'ENUM_TYPE_NAME_NOT_FOUND',
  QUERY_READ_TIMEOUT = 'QUERY_READ_TIMEOUT',
  TRANSIENT_DATABASE_ERROR = 'TRANSIENT_DATABASE_ERROR',
  DUPLICATE_ENTRY_DETECTED = 'DUPLICATE_ENTRY_DETECTED',
  TOO_MANY_RECORDS_TO_UPDATE = 'TOO_MANY_RECORDS_TO_UPDATE',
  INVALID_INPUT = 'INVALID_INPUT',
  ORM_EVENT_DATA_CORRUPTED = 'ORM_EVENT_DATA_CORRUPTED',
  RLS_VALIDATION_FAILED = 'RLS_VALIDATION_FAILED',
  NO_ROLE_FOUND_FOR_USER_WORKSPACE = 'NO_ROLE_FOUND_FOR_USER_WORKSPACE',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  MALFORMED_SQL = 'MALFORMED_SQL',
  UNKNOWN_OBJECT = 'UNKNOWN_OBJECT',
  UNKNOWN_COLUMN = 'UNKNOWN_COLUMN',
  UNKNOWN_RELATION = 'UNKNOWN_RELATION',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
  MISSING_ALIAS = 'MISSING_ALIAS',
  INVALID_QUERY = 'INVALID_QUERY',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
}

const getTwentyOrmExceptionUserFriendlyMessage = (
  code: TwentyOrmExceptionCode,
) => {
  switch (code) {
    case TwentyOrmExceptionCode.WORKSPACE_SCHEMA_NOT_FOUND:
      return msg`Workspace schema not found.`;
    case TwentyOrmExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND:
      return msg`Roles and permissions configuration not found.`;
    case TwentyOrmExceptionCode.FEATURE_FLAG_MAP_VERSION_NOT_FOUND:
      return msg`Feature configuration not found.`;
    case TwentyOrmExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND:
      return msg`User workspace role configuration not found.`;
    case TwentyOrmExceptionCode.API_KEY_ROLE_MAP_VERSION_NOT_FOUND:
      return msg`API key role configuration not found.`;
    case TwentyOrmExceptionCode.MALFORMED_METADATA:
      return msg`Data structure is invalid.`;
    case TwentyOrmExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case TwentyOrmExceptionCode.CONNECT_RECORD_NOT_FOUND:
      return msg`Related record not found.`;
    case TwentyOrmExceptionCode.CONNECT_NOT_ALLOWED:
      return msg`This connection is not allowed.`;
    case TwentyOrmExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
      return msg`A record with this relationship already exists.`;
    case TwentyOrmExceptionCode.MISSING_MAIN_ALIAS_TARGET:
      return msg`Missing main alias target.`;
    case TwentyOrmExceptionCode.METHOD_NOT_ALLOWED:
      return msg`This operation is not allowed.`;
    case TwentyOrmExceptionCode.QUERY_READ_TIMEOUT:
      return msg`Query timed out. Please try again.`;
    case TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR:
      return TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE;
    case TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED:
      return msg`A duplicate entry was detected.`;
    case TwentyOrmExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
      return msg`Too many records to update at once.`;
    case TwentyOrmExceptionCode.INVALID_INPUT:
      return INVALID_INPUT_USER_FRIENDLY_MESSAGE;
    case TwentyOrmExceptionCode.RLS_VALIDATION_FAILED:
      return msg`Record does not satisfy security constraints.`;
    case TwentyOrmExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE:
      return msg`No role found for user.`;
    case TwentyOrmExceptionCode.ENUM_TYPE_NAME_NOT_FOUND:
    case TwentyOrmExceptionCode.ORM_EVENT_DATA_CORRUPTED:
    case TwentyOrmExceptionCode.MISSING_PARAMETER:
    case TwentyOrmExceptionCode.INVALID_PARAMETER:
    case TwentyOrmExceptionCode.MALFORMED_SQL:
    case TwentyOrmExceptionCode.UNKNOWN_OBJECT:
    case TwentyOrmExceptionCode.UNKNOWN_COLUMN:
    case TwentyOrmExceptionCode.UNKNOWN_RELATION:
    case TwentyOrmExceptionCode.UNSUPPORTED_OPERATION:
    case TwentyOrmExceptionCode.MISSING_ALIAS:
    case TwentyOrmExceptionCode.INVALID_QUERY:
    case TwentyOrmExceptionCode.ENTITY_NOT_FOUND:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};
const TWENTY_ORM_EXCEPTION_CATEGORY_BY_CODE = {
  [TwentyOrmExceptionCode.WORKSPACE_SCHEMA_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.FEATURE_FLAG_MAP_VERSION_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.API_KEY_ROLE_MAP_VERSION_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.MALFORMED_METADATA]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.WORKSPACE_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.CONNECT_RECORD_NOT_FOUND]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.CONNECT_NOT_ALLOWED]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.MISSING_MAIN_ALIAS_TARGET]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.METHOD_NOT_ALLOWED]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.ENUM_TYPE_NAME_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.QUERY_READ_TIMEOUT]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.TOO_MANY_RECORDS_TO_UPDATE]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.INVALID_INPUT]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.ORM_EVENT_DATA_CORRUPTED]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.RLS_VALIDATION_FAILED]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE]:
    'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.MISSING_PARAMETER]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.INVALID_PARAMETER]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.MALFORMED_SQL]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.UNKNOWN_OBJECT]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.UNKNOWN_COLUMN]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.UNKNOWN_RELATION]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.UNSUPPORTED_OPERATION]: 'BAD_USER_INPUT',
  [TwentyOrmExceptionCode.MISSING_ALIAS]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.INVALID_QUERY]: 'INTERNAL_SERVER_ERROR',
  [TwentyOrmExceptionCode.ENTITY_NOT_FOUND]: 'BAD_USER_INPUT',
} as const satisfies Record<TwentyOrmExceptionCode, ExceptionCategory>;

export class TwentyOrmException extends CustomException<TwentyOrmExceptionCode> {
  constructor(
    message: string,
    code: TwentyOrmExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getTwentyOrmExceptionUserFriendlyMessage(code),
      category: TWENTY_ORM_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

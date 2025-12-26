import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum TwentyORMExceptionCode {
  METADATA_VERSION_MISMATCH = 'METADATA_VERSION_MISMATCH',
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
  DUPLICATE_ENTRY_DETECTED = 'DUPLICATE_ENTRY_DETECTED',
  TOO_MANY_RECORDS_TO_UPDATE = 'TOO_MANY_RECORDS_TO_UPDATE',
  INVALID_INPUT = 'INVALID_INPUT',
  ORM_EVENT_DATA_CORRUPTED = 'ORM_EVENT_DATA_CORRUPTED',
}

const twentyORMExceptionUserFriendlyMessages: Record<
  TwentyORMExceptionCode,
  MessageDescriptor
> = {
  [TwentyORMExceptionCode.METADATA_VERSION_MISMATCH]: msg`Data version mismatch. Please refresh and try again.`,
  [TwentyORMExceptionCode.WORKSPACE_SCHEMA_NOT_FOUND]: msg`Workspace schema not found.`,
  [TwentyORMExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND]: msg`Roles and permissions configuration not found.`,
  [TwentyORMExceptionCode.FEATURE_FLAG_MAP_VERSION_NOT_FOUND]: msg`Feature configuration not found.`,
  [TwentyORMExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND]: msg`User workspace role configuration not found.`,
  [TwentyORMExceptionCode.API_KEY_ROLE_MAP_VERSION_NOT_FOUND]: msg`API key role configuration not found.`,
  [TwentyORMExceptionCode.MALFORMED_METADATA]: msg`Data structure is invalid.`,
  [TwentyORMExceptionCode.WORKSPACE_NOT_FOUND]: msg`Workspace not found.`,
  [TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND]: msg`Related record not found.`,
  [TwentyORMExceptionCode.CONNECT_NOT_ALLOWED]: msg`This connection is not allowed.`,
  [TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR]: msg`A record with this relationship already exists.`,
  [TwentyORMExceptionCode.MISSING_MAIN_ALIAS_TARGET]: msg`Missing main alias target.`,
  [TwentyORMExceptionCode.METHOD_NOT_ALLOWED]: msg`This operation is not allowed.`,
  [TwentyORMExceptionCode.ENUM_TYPE_NAME_NOT_FOUND]: msg`Enum type not found.`,
  [TwentyORMExceptionCode.QUERY_READ_TIMEOUT]: msg`Query timed out. Please try again.`,
  [TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED]: msg`A duplicate entry was detected.`,
  [TwentyORMExceptionCode.TOO_MANY_RECORDS_TO_UPDATE]: msg`Too many records to update at once.`,
  [TwentyORMExceptionCode.INVALID_INPUT]: msg`Invalid input provided.`,
  [TwentyORMExceptionCode.ORM_EVENT_DATA_CORRUPTED]: msg`Event data is corrupted.`,
};

export class TwentyORMException extends CustomException<TwentyORMExceptionCode> {
  constructor(
    message: string,
    code: TwentyORMExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? twentyORMExceptionUserFriendlyMessages[code],
    });
  }
}

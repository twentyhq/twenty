import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum RemoteTableExceptionCode {
  REMOTE_TABLE_NOT_FOUND = 'REMOTE_TABLE_NOT_FOUND',
  INVALID_REMOTE_TABLE_INPUT = 'INVALID_REMOTE_TABLE_INPUT',
  REMOTE_TABLE_ALREADY_EXISTS = 'REMOTE_TABLE_ALREADY_EXISTS',
  NO_FOREIGN_TABLES_FOUND = 'NO_FOREIGN_TABLES_FOUND',
  NO_OBJECT_METADATA_FOUND = 'NO_OBJECT_METADATA_FOUND',
  NO_FIELD_METADATA_FOUND = 'NO_FIELD_METADATA_FOUND',
}

const remoteTableExceptionUserFriendlyMessages: Record<
  RemoteTableExceptionCode,
  MessageDescriptor
> = {
  [RemoteTableExceptionCode.REMOTE_TABLE_NOT_FOUND]: msg`Remote table not found.`,
  [RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT]: msg`Invalid remote table input.`,
  [RemoteTableExceptionCode.REMOTE_TABLE_ALREADY_EXISTS]: msg`Remote table already exists.`,
  [RemoteTableExceptionCode.NO_FOREIGN_TABLES_FOUND]: msg`No foreign tables found.`,
  [RemoteTableExceptionCode.NO_OBJECT_METADATA_FOUND]: msg`Object metadata not found.`,
  [RemoteTableExceptionCode.NO_FIELD_METADATA_FOUND]: msg`Field metadata not found.`,
};

export class RemoteTableException extends CustomException<RemoteTableExceptionCode> {
  constructor(
    message: string,
    code: RemoteTableExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? remoteTableExceptionUserFriendlyMessages[code],
    });
  }
}

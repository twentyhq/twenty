import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum RemoteTableExceptionCode {
  REMOTE_TABLE_NOT_FOUND = 'REMOTE_TABLE_NOT_FOUND',
  INVALID_REMOTE_TABLE_INPUT = 'INVALID_REMOTE_TABLE_INPUT',
  REMOTE_TABLE_ALREADY_EXISTS = 'REMOTE_TABLE_ALREADY_EXISTS',
  NO_FOREIGN_TABLES_FOUND = 'NO_FOREIGN_TABLES_FOUND',
  NO_OBJECT_METADATA_FOUND = 'NO_OBJECT_METADATA_FOUND',
  NO_FIELD_METADATA_FOUND = 'NO_FIELD_METADATA_FOUND',
}

const getRemoteTableExceptionUserFriendlyMessage = (
  code: RemoteTableExceptionCode,
) => {
  switch (code) {
    case RemoteTableExceptionCode.REMOTE_TABLE_NOT_FOUND:
      return msg`Remote table not found.`;
    case RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT:
      return msg`Invalid remote table input.`;
    case RemoteTableExceptionCode.REMOTE_TABLE_ALREADY_EXISTS:
      return msg`Remote table already exists.`;
    case RemoteTableExceptionCode.NO_FOREIGN_TABLES_FOUND:
      return msg`No foreign tables found.`;
    case RemoteTableExceptionCode.NO_OBJECT_METADATA_FOUND:
      return msg`Object metadata not found.`;
    case RemoteTableExceptionCode.NO_FIELD_METADATA_FOUND:
      return msg`Field metadata not found.`;
    default:
      assertUnreachable(code);
  }
};

export class RemoteTableException extends CustomException<RemoteTableExceptionCode> {
  constructor(
    message: string,
    code: RemoteTableExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getRemoteTableExceptionUserFriendlyMessage(code),
    });
  }
}

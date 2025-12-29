import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum RemoteServerExceptionCode {
  REMOTE_SERVER_NOT_FOUND = 'REMOTE_SERVER_NOT_FOUND',
  REMOTE_SERVER_ALREADY_EXISTS = 'REMOTE_SERVER_ALREADY_EXISTS',
  REMOTE_SERVER_MUTATION_NOT_ALLOWED = 'REMOTE_SERVER_MUTATION_NOT_ALLOWED',
  REMOTE_SERVER_CONNECTION_ERROR = 'REMOTE_SERVER_CONNECTION_ERROR',
  INVALID_REMOTE_SERVER_INPUT = 'INVALID_REMOTE_SERVER_INPUT',
}

const getRemoteServerExceptionUserFriendlyMessage = (
  code: RemoteServerExceptionCode,
) => {
  switch (code) {
    case RemoteServerExceptionCode.REMOTE_SERVER_NOT_FOUND:
      return msg`Remote server not found.`;
    case RemoteServerExceptionCode.REMOTE_SERVER_ALREADY_EXISTS:
      return msg`Remote server already exists.`;
    case RemoteServerExceptionCode.REMOTE_SERVER_MUTATION_NOT_ALLOWED:
      return msg`This remote server cannot be modified.`;
    case RemoteServerExceptionCode.REMOTE_SERVER_CONNECTION_ERROR:
      return msg`Failed to connect to remote server.`;
    case RemoteServerExceptionCode.INVALID_REMOTE_SERVER_INPUT:
      return msg`Invalid remote server input.`;
    default:
      assertUnreachable(code);
  }
};

export class RemoteServerException extends CustomException<RemoteServerExceptionCode> {
  constructor(
    message: string,
    code: RemoteServerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getRemoteServerExceptionUserFriendlyMessage(code),
    });
  }
}

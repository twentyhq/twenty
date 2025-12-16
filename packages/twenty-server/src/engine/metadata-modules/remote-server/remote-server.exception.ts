import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum RemoteServerExceptionCode {
  REMOTE_SERVER_NOT_FOUND = 'REMOTE_SERVER_NOT_FOUND',
  REMOTE_SERVER_ALREADY_EXISTS = 'REMOTE_SERVER_ALREADY_EXISTS',
  REMOTE_SERVER_MUTATION_NOT_ALLOWED = 'REMOTE_SERVER_MUTATION_NOT_ALLOWED',
  REMOTE_SERVER_CONNECTION_ERROR = 'REMOTE_SERVER_CONNECTION_ERROR',
  INVALID_REMOTE_SERVER_INPUT = 'INVALID_REMOTE_SERVER_INPUT',
}

const remoteServerExceptionUserFriendlyMessages: Record<
  RemoteServerExceptionCode,
  MessageDescriptor
> = {
  [RemoteServerExceptionCode.REMOTE_SERVER_NOT_FOUND]: msg`Remote server not found.`,
  [RemoteServerExceptionCode.REMOTE_SERVER_ALREADY_EXISTS]: msg`Remote server already exists.`,
  [RemoteServerExceptionCode.REMOTE_SERVER_MUTATION_NOT_ALLOWED]: msg`This remote server cannot be modified.`,
  [RemoteServerExceptionCode.REMOTE_SERVER_CONNECTION_ERROR]: msg`Failed to connect to remote server.`,
  [RemoteServerExceptionCode.INVALID_REMOTE_SERVER_INPUT]: msg`Invalid remote server input.`,
};

export class RemoteServerException extends CustomException<RemoteServerExceptionCode> {
  constructor(
    message: string,
    code: RemoteServerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? remoteServerExceptionUserFriendlyMessages[code],
    });
  }
}

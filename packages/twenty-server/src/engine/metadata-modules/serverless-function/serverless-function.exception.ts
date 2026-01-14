import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ServerlessFunctionExceptionCode {
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
  SERVERLESS_FUNCTION_VERSION_NOT_FOUND = 'SERVERLESS_FUNCTION_VERSION_NOT_FOUND',
  SERVERLESS_FUNCTION_ALREADY_EXIST = 'SERVERLESS_FUNCTION_ALREADY_EXIST',
  SERVERLESS_FUNCTION_NOT_READY = 'SERVERLESS_FUNCTION_NOT_READY',
  SERVERLESS_FUNCTION_BUILDING = 'SERVERLESS_FUNCTION_BUILDING',
  SERVERLESS_FUNCTION_CODE_UNCHANGED = 'SERVERLESS_FUNCTION_CODE_UNCHANGED',
  SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED = 'SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED',
  SERVERLESS_FUNCTION_CREATE_FAILED = 'SERVERLESS_FUNCTION_CREATE_FAILED',
  SERVERLESS_FUNCTION_EXECUTION_TIMEOUT = 'SERVERLESS_FUNCTION_EXECUTION_TIMEOUT',
}

const getServerlessFunctionExceptionUserFriendlyMessage = (
  code: ServerlessFunctionExceptionCode,
) => {
  switch (code) {
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
      return msg`Function not found.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_VERSION_NOT_FOUND:
      return msg`Function version not found.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST:
      return msg`A function with this name already exists.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_READY:
      return msg`Function is not ready.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_BUILDING:
      return msg`Function is currently building.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CODE_UNCHANGED:
      return msg`Function code is unchanged.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED:
      return msg`Function execution limit reached.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CREATE_FAILED:
      return msg`Failed to create function.`;
    case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_TIMEOUT:
      return msg`Function execution timed out.`;
    default:
      assertUnreachable(code);
  }
};

export class ServerlessFunctionException extends CustomException<ServerlessFunctionExceptionCode> {
  constructor(
    message: string,
    code: ServerlessFunctionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getServerlessFunctionExceptionUserFriendlyMessage(code),
    });
  }
}

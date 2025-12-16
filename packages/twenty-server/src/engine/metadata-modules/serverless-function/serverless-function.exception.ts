import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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

const serverlessFunctionExceptionUserFriendlyMessages: Record<
  ServerlessFunctionExceptionCode,
  MessageDescriptor
> = {
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND]: msg`Function not found.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_VERSION_NOT_FOUND]: msg`Function version not found.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST]: msg`A function with this name already exists.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_READY]: msg`Function is not ready.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_BUILDING]: msg`Function is currently building.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CODE_UNCHANGED]: msg`Function code is unchanged.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED]: msg`Function execution limit reached.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CREATE_FAILED]: msg`Failed to create function.`,
  [ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_TIMEOUT]: msg`Function execution timed out.`,
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
        serverlessFunctionExceptionUserFriendlyMessages[code],
    });
  }
}

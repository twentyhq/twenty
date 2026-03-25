import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum LogicFunctionExceptionCode {
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  LOGIC_FUNCTION_ALREADY_EXIST = 'LOGIC_FUNCTION_ALREADY_EXIST',
  LOGIC_FUNCTION_NOT_READY = 'LOGIC_FUNCTION_NOT_READY',
  LOGIC_FUNCTION_BUILDING = 'LOGIC_FUNCTION_BUILDING',
  LOGIC_FUNCTION_CODE_UNCHANGED = 'LOGIC_FUNCTION_CODE_UNCHANGED',
  LOGIC_FUNCTION_EXECUTION_LIMIT_REACHED = 'LOGIC_FUNCTION_EXECUTION_LIMIT_REACHED',
  LOGIC_FUNCTION_CREATE_FAILED = 'LOGIC_FUNCTION_CREATE_FAILED',
  LOGIC_FUNCTION_EXECUTION_TIMEOUT = 'LOGIC_FUNCTION_EXECUTION_TIMEOUT',
  LOGIC_FUNCTION_DISABLED = 'LOGIC_FUNCTION_DISABLED',
  LOGIC_FUNCTION_INVALID_SEED_PROJECT = 'LOGIC_FUNCTION_INVALID_SEED_PROJECT',
}

const getLogicFunctionExceptionUserFriendlyMessage = (
  code: LogicFunctionExceptionCode,
) => {
  switch (code) {
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Function not found.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_ALREADY_EXIST:
      return msg`A function with this name already exists.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_READY:
      return msg`Function is not ready.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_BUILDING:
      return msg`Function is currently building.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_CODE_UNCHANGED:
      return msg`Function code is unchanged.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_LIMIT_REACHED:
      return msg`Function execution limit reached.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED:
      return msg`Failed to create function.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_TIMEOUT:
      return msg`Function execution timed out.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED:
      return msg`Logic function execution is disabled.`;
    case LogicFunctionExceptionCode.LOGIC_FUNCTION_INVALID_SEED_PROJECT:
      return msg`Invalid seed project configuration.`;
    default:
      assertUnreachable(code);
  }
};

export class LogicFunctionException extends CustomException<LogicFunctionExceptionCode> {
  constructor(
    message: string,
    code: LogicFunctionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getLogicFunctionExceptionUserFriendlyMessage(code),
    });
  }
}

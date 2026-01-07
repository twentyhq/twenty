import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum RouteTriggerExceptionCode {
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  TRIGGER_NOT_FOUND = 'TRIGGER_NOT_FOUND',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
  ROUTE_ALREADY_EXIST = 'ROUTE_ALREADY_EXIST',
  ROUTE_PATH_ALREADY_EXIST = 'ROUTE_PATH_ALREADY_EXIST',
  FORBIDDEN_EXCEPTION = 'FORBIDDEN_EXCEPTION',
  SERVERLESS_FUNCTION_EXECUTION_ERROR = 'SERVERLESS_FUNCTION_EXECUTION_ERROR',
}

const getRouteTriggerExceptionUserFriendlyMessage = (
  code: RouteTriggerExceptionCode,
) => {
  switch (code) {
    case RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case RouteTriggerExceptionCode.ROUTE_NOT_FOUND:
      return msg`Route not found.`;
    case RouteTriggerExceptionCode.TRIGGER_NOT_FOUND:
      return msg`Trigger not found.`;
    case RouteTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
      return msg`Serverless function not found.`;
    case RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST:
      return msg`Route already exists.`;
    case RouteTriggerExceptionCode.ROUTE_PATH_ALREADY_EXIST:
      return msg`Route path already exists.`;
    case RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION:
      return msg`You do not have permission to perform this action.`;
    case RouteTriggerExceptionCode.SERVERLESS_FUNCTION_EXECUTION_ERROR:
      return msg`Serverless function execution failed.`;
    default:
      assertUnreachable(code);
  }
};

export class RouteTriggerException extends CustomException<RouteTriggerExceptionCode> {
  constructor(
    message: string,
    code: RouteTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getRouteTriggerExceptionUserFriendlyMessage(code),
    });
  }
}

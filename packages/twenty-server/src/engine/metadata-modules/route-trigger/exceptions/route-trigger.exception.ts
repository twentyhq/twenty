import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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

const routeTriggerExceptionUserFriendlyMessages: Record<
  RouteTriggerExceptionCode,
  MessageDescriptor
> = {
  [RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND]: msg`Workspace not found.`,
  [RouteTriggerExceptionCode.ROUTE_NOT_FOUND]: msg`Route not found.`,
  [RouteTriggerExceptionCode.TRIGGER_NOT_FOUND]: msg`Trigger not found.`,
  [RouteTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND]: msg`Serverless function not found.`,
  [RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST]: msg`Route already exists.`,
  [RouteTriggerExceptionCode.ROUTE_PATH_ALREADY_EXIST]: msg`Route path already exists.`,
  [RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION]: msg`You do not have permission to perform this action.`,
  [RouteTriggerExceptionCode.SERVERLESS_FUNCTION_EXECUTION_ERROR]: msg`Serverless function execution failed.`,
};

export class RouteTriggerException extends CustomException<RouteTriggerExceptionCode> {
  constructor(
    message: string,
    code: RouteTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? routeTriggerExceptionUserFriendlyMessages[code],
    });
  }
}

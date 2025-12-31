import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum DatabaseEventTriggerExceptionCode {
  DATABASE_EVENT_TRIGGER_NOT_FOUND = 'DATABASE_EVENT_TRIGGER_NOT_FOUND',
  DATABASE_EVENT_TRIGGER_ALREADY_EXIST = 'DATABASE_EVENT_TRIGGER_ALREADY_EXIST',
  DATABASE_EVENT_TRIGGER_INVALID = 'DATABASE_EVENT_TRIGGER_INVALID',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
}

const getDatabaseEventTriggerExceptionUserFriendlyMessage = (
  code: DatabaseEventTriggerExceptionCode,
) => {
  switch (code) {
    case DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND:
      return msg`Database event trigger not found.`;
    case DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_ALREADY_EXIST:
      return msg`Database event trigger already exists.`;
    case DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_INVALID:
      return msg`Invalid database event trigger.`;
    case DatabaseEventTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
      return msg`Serverless function not found.`;
    default:
      assertUnreachable(code);
  }
};

export class DatabaseEventTriggerException extends CustomException<DatabaseEventTriggerExceptionCode> {
  constructor(
    message: string,
    code: DatabaseEventTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getDatabaseEventTriggerExceptionUserFriendlyMessage(code),
    });
  }
}

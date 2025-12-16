import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum DatabaseEventTriggerExceptionCode {
  DATABASE_EVENT_TRIGGER_NOT_FOUND = 'DATABASE_EVENT_TRIGGER_NOT_FOUND',
  DATABASE_EVENT_TRIGGER_ALREADY_EXIST = 'DATABASE_EVENT_TRIGGER_ALREADY_EXIST',
  DATABASE_EVENT_TRIGGER_INVALID = 'DATABASE_EVENT_TRIGGER_INVALID',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
}

const databaseEventTriggerExceptionUserFriendlyMessages: Record<
  DatabaseEventTriggerExceptionCode,
  MessageDescriptor
> = {
  [DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND]: msg`Database event trigger not found.`,
  [DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_ALREADY_EXIST]: msg`Database event trigger already exists.`,
  [DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_INVALID]: msg`Invalid database event trigger.`,
  [DatabaseEventTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND]: msg`Serverless function not found.`,
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
        databaseEventTriggerExceptionUserFriendlyMessages[code],
    });
  }
}

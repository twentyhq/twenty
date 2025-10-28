import { CustomException } from 'src/utils/custom-exception';

export class DatabaseEventTriggerException extends CustomException {
  constructor(message: string, code: DatabaseEventTriggerExceptionCode) {
    super(message, code);
  }
}

export enum DatabaseEventTriggerExceptionCode {
  DATABASE_EVENT_TRIGGER_NOT_FOUND = 'DATABASE_EVENT_TRIGGER_NOT_FOUND',
  DATABASE_EVENT_TRIGGER_ALREADY_EXIST = 'DATABASE_EVENT_TRIGGER_ALREADY_EXIST',
  DATABASE_EVENT_TRIGGER_INVALID = 'DATABASE_EVENT_TRIGGER_INVALID',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
}

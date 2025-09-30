import { CustomException } from 'src/utils/custom-exception';

export class CronTriggerException extends CustomException {
  constructor(message: string, code: CronTriggerExceptionCode) {
    super(message, code);
  }
}

export enum CronTriggerExceptionCode {
  CRON_TRIGGER_NOT_FOUND = 'CRON_TRIGGER_NOT_FOUND',
  CRON_TRIGGER_ALREADY_EXIST = 'CRON_TRIGGER_ALREADY_EXIST',
}

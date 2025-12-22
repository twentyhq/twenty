import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum CronTriggerExceptionCode {
  CRON_TRIGGER_NOT_FOUND = 'CRON_TRIGGER_NOT_FOUND',
  CRON_TRIGGER_ALREADY_EXIST = 'CRON_TRIGGER_ALREADY_EXIST',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
}

const cronTriggerExceptionUserFriendlyMessages: Record<
  CronTriggerExceptionCode,
  MessageDescriptor
> = {
  [CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND]: msg`Cron trigger not found.`,
  [CronTriggerExceptionCode.CRON_TRIGGER_ALREADY_EXIST]: msg`Cron trigger already exists.`,
  [CronTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND]: msg`Serverless function not found.`,
};

export class CronTriggerException extends CustomException<CronTriggerExceptionCode> {
  constructor(
    message: string,
    code: CronTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? cronTriggerExceptionUserFriendlyMessages[code],
    });
  }
}

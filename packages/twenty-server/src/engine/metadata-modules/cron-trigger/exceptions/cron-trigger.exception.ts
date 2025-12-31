import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CronTriggerExceptionCode {
  CRON_TRIGGER_NOT_FOUND = 'CRON_TRIGGER_NOT_FOUND',
  CRON_TRIGGER_ALREADY_EXIST = 'CRON_TRIGGER_ALREADY_EXIST',
  SERVERLESS_FUNCTION_NOT_FOUND = 'SERVERLESS_FUNCTION_NOT_FOUND',
}

const getCronTriggerExceptionUserFriendlyMessage = (
  code: CronTriggerExceptionCode,
) => {
  switch (code) {
    case CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND:
      return msg`Cron trigger not found.`;
    case CronTriggerExceptionCode.CRON_TRIGGER_ALREADY_EXIST:
      return msg`Cron trigger already exists.`;
    case CronTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
      return msg`Serverless function not found.`;
    default:
      assertUnreachable(code);
  }
};

export class CronTriggerException extends CustomException<CronTriggerExceptionCode> {
  constructor(
    message: string,
    code: CronTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getCronTriggerExceptionUserFriendlyMessage(code),
    });
  }
}

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum ConnectedAccountSyncWebhookExceptionCode {
  MISSING_REQUEST_BODY = 'MISSING_REQUEST_BODY',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
}

const getConnectedAccountSyncWebhookExceptionUserFriendlyMessage = (
  code: ConnectedAccountSyncWebhookExceptionCode,
) => {
  switch (code) {
    case ConnectedAccountSyncWebhookExceptionCode.MISSING_REQUEST_BODY:
    case ConnectedAccountSyncWebhookExceptionCode.INVALID_PAYLOAD:
      return msg`The webhook request could not be processed.`;
    case ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE:
      return msg`The webhook request could not be authenticated.`;
    default:
      assertUnreachable(code);
  }
};
const CONNECTED_ACCOUNT_SYNC_WEBHOOK_EXCEPTION_CATEGORY_BY_CODE = {
  [ConnectedAccountSyncWebhookExceptionCode.MISSING_REQUEST_BODY]:
    'BAD_USER_INPUT',
  [ConnectedAccountSyncWebhookExceptionCode.INVALID_PAYLOAD]: 'BAD_USER_INPUT',
  [ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE]: 'FORBIDDEN',
} as const satisfies Record<
  ConnectedAccountSyncWebhookExceptionCode,
  ExceptionCategory
>;

export class ConnectedAccountSyncWebhookException extends CustomException<ConnectedAccountSyncWebhookExceptionCode> {
  constructor(
    message: string,
    code: ConnectedAccountSyncWebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getConnectedAccountSyncWebhookExceptionUserFriendlyMessage(code),
      category: CONNECTED_ACCOUNT_SYNC_WEBHOOK_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

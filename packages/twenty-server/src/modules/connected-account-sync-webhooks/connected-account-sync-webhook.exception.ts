import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

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
    });
  }
}

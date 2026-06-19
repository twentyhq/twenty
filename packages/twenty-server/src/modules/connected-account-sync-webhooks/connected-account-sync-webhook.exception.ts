import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { ConnectedAccountSyncWebhookExceptionCode } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook-exception-code.enum';
import { CustomException } from 'src/utils/custom-exception';

const getConnectedAccountSyncWebhookExceptionUserFriendlyMessage = (
  code: ConnectedAccountSyncWebhookExceptionCode,
) => {
  switch (code) {
    case ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_MISSING_REQUEST_BODY:
    case ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_PAYLOAD:
      return msg`The webhook request could not be processed.`;
    case ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_SIGNATURE:
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

import { assertUnreachable } from 'twenty-shared/utils';

import { ConnectedAccountSyncWebhookExceptionCode } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook-exception-code.enum';
import { type ConnectedAccountSyncWebhookException } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';

export const getConnectedAccountSyncWebhookExceptionStatusCode = (
  exception: ConnectedAccountSyncWebhookException,
): 400 | 403 => {
  switch (exception.code) {
    case ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_MISSING_REQUEST_BODY:
    case ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_PAYLOAD:
      return 400;
    case ConnectedAccountSyncWebhookExceptionCode.CONNECTED_ACCOUNT_SYNC_WEBHOOK_INVALID_SIGNATURE:
      return 403;
    default: {
      return assertUnreachable(exception.code);
    }
  }
};

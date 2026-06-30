import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConnectedAccountSyncWebhookException,
  ConnectedAccountSyncWebhookExceptionCode,
} from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';

export const getConnectedAccountSyncWebhookExceptionStatusCode = (
  exception: ConnectedAccountSyncWebhookException,
): 400 | 403 => {
  switch (exception.code) {
    case ConnectedAccountSyncWebhookExceptionCode.MISSING_REQUEST_BODY:
    case ConnectedAccountSyncWebhookExceptionCode.INVALID_PAYLOAD:
      return 400;
    case ConnectedAccountSyncWebhookExceptionCode.INVALID_SIGNATURE:
      return 403;
    default: {
      return assertUnreachable(exception.code);
    }
  }
};

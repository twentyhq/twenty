import { createHmac } from 'crypto';

import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';

// Keyed by a server secret, so a member cannot predict, and create first, a
// record a sender will write to
export const buildInboxConversationKey = ({
  appSecret,
  workspaceId,
  senderKey,
  threadKey,
}: {
  appSecret: string;
  workspaceId: string;
  senderKey: string;
  threadKey: string;
}): string =>
  createHmac(
    'sha256',
    deriveInstanceHmacKey({ rawKey: appSecret, purpose: 'agent-inbox-id' }),
  )
    .update(`${workspaceId}:${senderKey}:${threadKey}`)
    .digest('hex');

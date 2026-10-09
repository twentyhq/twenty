import { createHmac } from 'crypto';

import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';

// Keyed by a server secret, so a member cannot predict, and create first, a
// thread a sender or an agent run will write to
export const buildConversationKey = ({
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
    deriveInstanceHmacKey({ rawKey: appSecret, purpose: 'conversation-id' }),
  )
    .update(`${workspaceId}:${senderKey}:${threadKey}`)
    .digest('hex');

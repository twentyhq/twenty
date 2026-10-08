import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

// The key is the conversation, shared by every member it is sent to
export const buildInboxThreadId = ({
  senderKey,
  threadKey,
}: {
  senderKey: string;
  threadKey: string;
}): string => v5(`${senderKey}:${threadKey}`, INBOX_MESSAGE_ID_NAMESPACE);

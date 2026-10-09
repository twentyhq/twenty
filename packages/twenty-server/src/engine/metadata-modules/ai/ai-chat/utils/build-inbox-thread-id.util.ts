import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

// The key is the conversation, shared by every member it is sent to
export const buildInboxThreadId = ({
  conversationKey,
}: {
  conversationKey: string;
}): string => v5(conversationKey, INBOX_MESSAGE_ID_NAMESPACE);

import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

// A conversation no member receives keeps an empty recipient in its key
export const buildInboxThreadId = ({
  senderKey,
  workspaceMemberId,
  threadKey,
}: {
  senderKey: string;
  workspaceMemberId: string | null;
  threadKey: string;
}): string =>
  v5(
    `${senderKey}:${workspaceMemberId ?? ''}:${threadKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );

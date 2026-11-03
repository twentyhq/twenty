import { v5 } from 'uuid';

import { INBOX_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-id-namespace.constant';

const UUID_SEPARATOR_PATTERN = /-/g;
const TOOL_CALL_ID_PREFIX = 'call_';

export const buildInboxMessageRecordIds = ({
  threadIdentity,
  idempotencyKey,
}: {
  threadIdentity: string;
  idempotencyKey: string;
}) => {
  const messageId = v5(
    `${threadIdentity}:message:${idempotencyKey}`,
    INBOX_MESSAGE_ID_NAMESPACE,
  );
  const toolCallMessageId = messageId.replace(UUID_SEPARATOR_PATTERN, '');

  return {
    messageId,
    toolCallId: `${TOOL_CALL_ID_PREFIX}${toolCallMessageId}`,
    turnId: v5(`${threadIdentity}:turn`, INBOX_MESSAGE_ID_NAMESPACE),
  };
};

import { isArray, isNull, isString } from '@sniptt/guards';
import { type ObjectLiteral } from 'typeorm';

import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

export const validateAgentHistoryConversationRecordsOrThrow = ({
  name,
  values,
  threadId,
  writtenMessageIds,
}: {
  name: AgentHistoryObjectName;
  values: ObjectLiteral | ObjectLiteral[];
  threadId: string | null;
  writtenMessageIds: ReadonlySet<string>;
}): void => {
  const records = isArray(values) ? values : [values];

  const normalizedThreadId = threadId?.toLowerCase() ?? null;

  for (const record of records) {
    if (name === 'agentMessagePart') {
      if (
        !isString(record.messageId) ||
        !writtenMessageIds.has(record.messageId.toLowerCase())
      ) {
        return throwAgentChatThreadNotFound();
      }
      continue;
    }

    const recordThreadId =
      name === 'agentChatThread' ? record.id : record.threadId;

    const normalizedRecordThreadId = isString(recordThreadId)
      ? recordThreadId.toLowerCase()
      : recordThreadId;

    const isUnscopedRecord = isNull(threadId) && name !== 'agentTurn';

    if (normalizedRecordThreadId !== normalizedThreadId || isUnscopedRecord) {
      return throwAgentChatThreadNotFound();
    }
  }
};

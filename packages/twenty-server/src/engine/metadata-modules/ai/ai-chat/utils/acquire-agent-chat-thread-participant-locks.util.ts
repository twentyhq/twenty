import { doNotTranslate } from 'twenty-shared/i18n';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { buildAgentChatThreadParticipantLockKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-lock-key.util';

export const acquireAgentChatThreadParticipantLocks = async ({
  executeQuery,
  participants,
}: {
  executeQuery: (args: {
    query: string;
    parameters: unknown[];
  }) => Promise<unknown>;
  participants: AgentChatThreadAccessArgs[];
}): Promise<void> => {
  const sortedLockKeys = [
    ...new Set(participants.map(buildAgentChatThreadParticipantLockKey)),
  ].sort();

  if (!isNonEmptyArray(sortedLockKeys)) {
    return;
  }

  await executeQuery({
    query: doNotTranslate(
      `SELECT pg_advisory_xact_lock(hashtextextended(lock_key, 0))
       FROM (
         SELECT unnest($1::text[]) AS lock_key
         ORDER BY lock_key
       ) participant_locks`,
    ),
    parameters: [sortedLockKeys],
  });
};

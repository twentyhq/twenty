import { type EntityManager } from 'typeorm';

import { AGENT_CHAT_ADVISORY_LOCK_QUERY_BY_MODE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-advisory-lock-query-by-mode.constant';

const AGENT_CHAT_THREAD_IDENTITY_LOCK_KEY_PREFIX = 'agent-chat-thread-identity';

export const acquireAgentChatThreadIdentityLock = async ({
  manager,
  workspaceId,
  mode,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  mode: 'shared' | 'exclusive';
}): Promise<void> => {
  await manager.query(AGENT_CHAT_ADVISORY_LOCK_QUERY_BY_MODE[mode], [
    `${AGENT_CHAT_THREAD_IDENTITY_LOCK_KEY_PREFIX}:${workspaceId}`,
  ]);
};

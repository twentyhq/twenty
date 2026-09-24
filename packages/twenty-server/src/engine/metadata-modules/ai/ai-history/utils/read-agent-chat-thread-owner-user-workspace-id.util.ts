import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectLiteral } from 'typeorm';

import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';

export const readAgentChatThreadOwnerUserWorkspaceId = (
  clause: ObjectLiteral,
): string => {
  const userWorkspaceId = clause.userWorkspaceId;

  if (!isNonEmptyString(userWorkspaceId)) {
    throw new AgentHistoryStorageException(
      'INVALID_CRITERIA',
      'Chat thread owner criteria must be a single user workspace ID',
    );
  }

  return userWorkspaceId;
};

import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectLiteral } from 'typeorm';

import { type AgentChatThreadOwnerMappingContext } from 'src/engine/metadata-modules/ai/ai-history/types/agent-chat-thread-owner-mapping-context.type';
import { resolveAgentChatThreadOwners } from 'src/engine/metadata-modules/ai/ai-history/utils/resolve-agent-chat-thread-owners.util';

export const hydrateAgentChatThreadOwners = async ({
  records,
  manager,
  workspaceId,
  ownerFields,
}: AgentChatThreadOwnerMappingContext & {
  records: ObjectLiteral[];
}): Promise<void> => {
  if (ownerFields.hasUserWorkspaceIdField) {
    return;
  }

  const ownedRecords = records.filter((record) =>
    isNonEmptyString(record.workspaceMemberId),
  );

  const userWorkspaceIdByWorkspaceMemberId = await resolveAgentChatThreadOwners(
    {
      manager,
      workspaceId,
      from: 'workspaceMemberId',
      ids: ownedRecords.map((record) => record.workspaceMemberId),
    },
  );

  for (const record of ownedRecords) {
    record.userWorkspaceId =
      userWorkspaceIdByWorkspaceMemberId.get(record.workspaceMemberId) ?? null;
  }
};

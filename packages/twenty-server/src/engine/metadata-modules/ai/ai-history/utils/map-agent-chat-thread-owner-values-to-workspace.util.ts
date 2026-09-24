import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentChatThreadOwnerMappingContext } from 'src/engine/metadata-modules/ai/ai-history/types/agent-chat-thread-owner-mapping-context.type';
import { readAgentChatThreadOwnerUserWorkspaceId } from 'src/engine/metadata-modules/ai/ai-history/utils/read-agent-chat-thread-owner-user-workspace-id.util';
import { resolveAgentChatThreadOwners } from 'src/engine/metadata-modules/ai/ai-history/utils/resolve-agent-chat-thread-owners.util';

export const mapAgentChatThreadOwnerValuesToWorkspace = async ({
  values,
  manager,
  workspaceId,
  ownerFields,
}: AgentChatThreadOwnerMappingContext & {
  values: ObjectLiteral | ObjectLiteral[];
}): Promise<ObjectLiteral | ObjectLiteral[]> => {
  const records = Array.isArray(values) ? values : [values];
  const ownedRecords = records.filter((record) => 'userWorkspaceId' in record);

  if (ownedRecords.length === 0 || !ownerFields.hasWorkspaceMemberField) {
    return values;
  }

  const workspaceMemberIdByUserWorkspaceId = await resolveAgentChatThreadOwners(
    {
      manager,
      workspaceId,
      from: 'userWorkspaceId',
      ids: ownedRecords.map(readAgentChatThreadOwnerUserWorkspaceId),
    },
  );

  const mappedRecords = records.map((record) => {
    if (!('userWorkspaceId' in record)) {
      return record;
    }

    const { userWorkspaceId, ...rest } = record;
    const workspaceMemberId =
      workspaceMemberIdByUserWorkspaceId.get(userWorkspaceId);

    if (!isDefined(workspaceMemberId)) {
      throw new AgentHistoryStorageException(
        'INVALID_CRITERIA',
        'Chat thread owner is not a member of this workspace',
      );
    }

    // Both columns exist only while the upgrade command runs; keep the legacy
    // column complete so it stays authoritative until it is dropped.
    return ownerFields.hasUserWorkspaceIdField
      ? { ...rest, userWorkspaceId, workspaceMemberId }
      : { ...rest, workspaceMemberId };
  });

  return Array.isArray(values) ? mappedRecords : mappedRecords[0];
};

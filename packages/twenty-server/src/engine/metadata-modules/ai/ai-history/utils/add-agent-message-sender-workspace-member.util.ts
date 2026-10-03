import { isNonEmptyString } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const addAgentMessageSenderWorkspaceMember = async (
  name: AgentHistoryObjectName,
  values: ObjectLiteral | ObjectLiteral[],
  workspaceId: string,
  { manager }: AgentHistoryStorageContext,
): Promise<ObjectLiteral | ObjectLiteral[]> => {
  if (name !== 'agentMessage') {
    return values;
  }
  const messages = Array.isArray(values) ? values : [values];
  const senderIds = [
    ...new Set(
      messages
        .map((message) => message.senderUserWorkspaceId)
        .filter(isNonEmptyString),
    ),
  ];
  if (senderIds.length === 0) {
    return values;
  }
  const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  const members = await manager.query<
    { membershipId: string; memberId: string }[]
  >(
    `SELECT membership.id AS "membershipId", member.id AS "memberId"
     FROM core."userWorkspace" membership
     JOIN ${schemaName}."workspaceMember" member
       ON member."userId" = membership."userId" AND member."deletedAt" IS NULL
     WHERE membership."workspaceId" = $1 AND membership.id = ANY($2::uuid[])`,
    [workspaceId, senderIds],
  );
  const memberIdByMembershipId = new Map(
    members.map(({ membershipId, memberId }) => [membershipId, memberId]),
  );
  const expandedMessages = messages.map((message) => ({
    ...message,
    senderWorkspaceMemberId:
      memberIdByMembershipId.get(message.senderUserWorkspaceId) ?? null,
  }));

  return Array.isArray(values) ? expandedMessages : expandedMessages[0];
};

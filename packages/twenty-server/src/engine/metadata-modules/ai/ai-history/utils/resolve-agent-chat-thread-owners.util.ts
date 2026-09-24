import { type EntityManager } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type AgentChatThreadOwnerKey = 'userWorkspaceId' | 'workspaceMemberId';

// Chat callers identify owners by membership (auth, billing and stream
// recipients use it), while workspace storage relates threads to members.
export const resolveAgentChatThreadOwners = async ({
  manager,
  workspaceId,
  from,
  ids,
}: {
  manager: EntityManager;
  workspaceId: string;
  from: AgentChatThreadOwnerKey;
  ids: string[];
}): Promise<Map<string, string>> => {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const rows: { userWorkspaceId: string; workspaceMemberId: string }[] =
    await manager.query(
      `SELECT DISTINCT ON (${from === 'userWorkspaceId' ? 'membership.id' : 'member.id'})
         membership.id AS "userWorkspaceId", member.id AS "workspaceMemberId"
       FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."workspaceMember" member
       JOIN core."userWorkspace" membership
         ON membership."userId" = member."userId" AND membership."workspaceId" = $1
       WHERE ${from === 'userWorkspaceId' ? 'membership.id' : 'member.id'} = ANY($2::uuid[])
       ORDER BY ${from === 'userWorkspaceId' ? 'membership.id' : 'member.id'},
         member."deletedAt" DESC NULLS FIRST, membership."deletedAt" DESC NULLS FIRST`,
      [workspaceId, uniqueIds],
    );

  const to: AgentChatThreadOwnerKey =
    from === 'userWorkspaceId' ? 'workspaceMemberId' : 'userWorkspaceId';

  return new Map(rows.map((row) => [row[from], row[to]]));
};

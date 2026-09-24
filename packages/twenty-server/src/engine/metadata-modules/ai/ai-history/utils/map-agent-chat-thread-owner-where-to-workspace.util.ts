import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type AgentChatThreadOwnerMappingContext } from 'src/engine/metadata-modules/ai/ai-history/types/agent-chat-thread-owner-mapping-context.type';
import { readAgentChatThreadOwnerUserWorkspaceId } from 'src/engine/metadata-modules/ai/ai-history/utils/read-agent-chat-thread-owner-user-workspace-id.util';
import { resolveAgentChatThreadOwners } from 'src/engine/metadata-modules/ai/ai-history/utils/resolve-agent-chat-thread-owners.util';
import { type WorkspaceFindOptions } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';

// Returns null when no clause can match: the membership has no member left.
export const mapAgentChatThreadOwnerWhereToWorkspace = async ({
  where,
  manager,
  workspaceId,
  ownerFields,
}: AgentChatThreadOwnerMappingContext & {
  where: WorkspaceFindOptions['where'];
}): Promise<WorkspaceFindOptions['where'] | null> => {
  if (!isDefined(where) || ownerFields.hasUserWorkspaceIdField) {
    return where;
  }

  const clauses: ObjectLiteral[] = Array.isArray(where) ? where : [where];
  const ownedClauses = clauses.filter((clause) => 'userWorkspaceId' in clause);

  if (ownedClauses.length === 0) {
    return where;
  }

  const workspaceMemberIdByUserWorkspaceId = await resolveAgentChatThreadOwners(
    {
      manager,
      workspaceId,
      from: 'userWorkspaceId',
      ids: ownedClauses.map(readAgentChatThreadOwnerUserWorkspaceId),
    },
  );

  const mappedClauses = clauses.flatMap((clause) => {
    if (!('userWorkspaceId' in clause)) {
      return [clause];
    }

    const { userWorkspaceId, ...rest } = clause;
    const workspaceMemberId =
      workspaceMemberIdByUserWorkspaceId.get(userWorkspaceId);

    return isDefined(workspaceMemberId) ? [{ ...rest, workspaceMemberId }] : [];
  });

  if (mappedClauses.length === 0) {
    return null;
  }

  return Array.isArray(where) ? mappedClauses : mappedClauses[0];
};

import { type EntityManager } from 'typeorm';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { getAgentChatThreadOwnerColumn } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-column.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const backfillChatThreadOwnerGrants = async ({
  manager,
  workspaceId,
  threadTableExpression,
  isCoreStorage,
  recordIds,
}: {
  manager: EntityManager;
  workspaceId: string;
  threadTableExpression: string;
  isCoreStorage: boolean;
  recordIds?: string[];
}): Promise<number> => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  const ownerColumn = await getAgentChatThreadOwnerColumn({
    manager,
    workspaceId,
    storage: isCoreStorage ? 'core' : 'workspace',
  });
  const ownerJoin =
    ownerColumn === 'workspaceMemberId'
      ? `JOIN ${schema}."workspaceMember" member ON member.id = thread."workspaceMemberId" AND member."deletedAt" IS NULL
    JOIN core."userWorkspace" membership ON membership."userId" = member."userId"
      AND membership."workspaceId" = $1 AND membership."deletedAt" IS NULL`
      : `JOIN core."userWorkspace" membership ON membership.id = thread."userWorkspaceId"
      AND membership."workspaceId" = $1 AND membership."deletedAt" IS NULL
    JOIN ${schema}."workspaceMember" member ON member."userId" = membership."userId" AND member."deletedAt" IS NULL`;
  const inserted = await manager.query<{ id: string }[]>(
    `
    INSERT INTO ${schema}."recordShare"
      ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
    SELECT metadata.id, thread.id, member.id, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', thread.id
    FROM ${threadTableExpression} thread
    ${ownerJoin}
    JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
    WHERE ${isCoreStorage ? 'thread."workspaceId" = $1 AND' : ''} ($3::uuid[] IS NULL OR thread.id = ANY($3::uuid[]))
    ON CONFLICT DO NOTHING RETURNING id`,
    [
      workspaceId,
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      recordIds ?? null,
    ],
  );
  return inserted.length;
};

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export const backfillWorkspaceChatThreadOwnerGrants = async ({
  transactionScope,
  workspaceId,
  threadTableExpression,
  recordIds,
}: {
  transactionScope: Pick<WorkspaceTransactionScope, 'executeRawQuery'>;
  workspaceId: string;
  threadTableExpression: string;
  recordIds?: string[];
}): Promise<number> => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  // Membership removal must wait until the owner grant commits before cleanup.
  const inserted = await transactionScope.executeRawQuery(
    `
    INSERT INTO ${schema}."recordShare"
      ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
    SELECT metadata.id, thread.id, thread."workspaceMemberId", 'WORKSPACE_MEMBER', 'FULL', 'OWNER', thread.id
    FROM ${threadTableExpression} thread
    JOIN ${schema}."workspaceMember" member ON member.id = thread."workspaceMemberId" AND member."deletedAt" IS NULL
    JOIN core."userWorkspace" membership ON membership."userId" = member."userId" AND membership."workspaceId" = $1 AND membership."deletedAt" IS NULL
    JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
    WHERE thread."workspaceMemberId" IS NOT NULL AND ($3::uuid[] IS NULL OR thread.id = ANY($3::uuid[]))
    FOR SHARE OF member, membership
    ON CONFLICT DO NOTHING RETURNING id`,
    [
      workspaceId,
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      recordIds ?? null,
    ],
  );
  return inserted.length;
};

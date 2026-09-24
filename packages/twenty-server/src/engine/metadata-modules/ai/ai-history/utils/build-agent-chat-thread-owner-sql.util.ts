import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const getWorkspaceMemberTable = (workspaceId: string): string =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."workspaceMember"`;

// Active members win over soft-deleted ones left behind by a re-invitation.
export const buildWorkspaceMemberIdFromUserWorkspaceIdSql = ({
  workspaceId,
  userWorkspaceIdSql,
}: {
  workspaceId: string;
  userWorkspaceIdSql: string;
}): string =>
  `(SELECT owner_member.id FROM ${getWorkspaceMemberTable(workspaceId)} owner_member
    JOIN core."userWorkspace" owner_membership ON owner_membership."userId" = owner_member."userId"
    WHERE owner_membership.id = ${userWorkspaceIdSql}
    ORDER BY owner_member."deletedAt" DESC NULLS FIRST LIMIT 1)`;

export const buildUserWorkspaceIdFromWorkspaceMemberIdSql = ({
  workspaceId,
  workspaceMemberIdSql,
  workspaceIdSql,
}: {
  workspaceId: string;
  workspaceMemberIdSql: string;
  workspaceIdSql: string;
}): string =>
  `(SELECT owner_membership.id FROM ${getWorkspaceMemberTable(workspaceId)} owner_member
    JOIN core."userWorkspace" owner_membership ON owner_membership."userId" = owner_member."userId"
      AND owner_membership."workspaceId" = ${workspaceIdSql}
    WHERE owner_member.id = ${workspaceMemberIdSql}
    ORDER BY owner_membership."deletedAt" DESC NULLS FIRST LIMIT 1)`;

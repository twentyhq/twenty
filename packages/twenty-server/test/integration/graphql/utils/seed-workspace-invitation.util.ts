import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const seedWorkspaceInvitation = async ({
  email,
  value,
  expiresAt,
  roleId,
  workspaceId = SEED_APPLE_WORKSPACE_ID,
}: {
  email: string;
  value: string;
  expiresAt: Date;
  roleId?: string;
  workspaceId?: string;
}): Promise<string> => {
  const insertedRows = await testDataSource.query(
    `INSERT INTO core."appToken" ("workspaceId", "type", "value", "expiresAt", "context")
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING "id"`,
    [
      workspaceId,
      AppTokenType.InvitationToken,
      value,
      expiresAt.toISOString(),
      JSON.stringify({ email, ...(roleId ? { roleId } : {}) }),
    ],
  );

  return insertedRows[0].id;
};

export const findWorkspaceInvitationsByEmail = ({
  email,
  workspaceId = SEED_APPLE_WORKSPACE_ID,
}: {
  email: string;
  workspaceId?: string;
}): Promise<{ value: string; expiresAt: string }[]> =>
  testDataSource.query(
    `SELECT "value", "expiresAt" FROM core."appToken" WHERE "workspaceId" = $1 AND context->>'email' = $2`,
    [workspaceId, email],
  );

export const deleteWorkspaceInvitationsByEmail = ({
  email,
  workspaceId = SEED_APPLE_WORKSPACE_ID,
}: {
  email: string;
  workspaceId?: string;
}) =>
  testDataSource.query(
    `DELETE FROM core."appToken" WHERE "workspaceId" = $1 AND context->>'email' = $2`,
    [workspaceId, email],
  );

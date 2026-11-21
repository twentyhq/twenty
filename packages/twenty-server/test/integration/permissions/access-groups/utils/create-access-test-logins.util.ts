import { type AccessTestLogin } from 'test/integration/permissions/access-groups/utils/access-test-login.type';
import { queryTestDatabase } from 'test/integration/permissions/access-groups/utils/query-test-database.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

export const createAccessTestLogins = async ({
  workspaceId,
  count,
}: {
  workspaceId: string;
  count: number;
}): Promise<AccessTestLogin[]> => {
  const schema = `"${getWorkspaceSchemaName(workspaceId)}"`;
  // Seeded users beyond the named ones have no workspace member yet
  const workspaceMembers = await queryTestDatabase<{
    id: string;
    userId: string;
  }>({
    sql: `INSERT INTO ${schema}."workspaceMember" ("userId", "userEmail", "nameFirstName", "nameLastName")
      SELECT "user"."id", "user"."email", 'Deal', "user"."email"
      FROM core."userWorkspace"
      JOIN core."user" ON "user"."id" = "userWorkspace"."userId"
      WHERE "userWorkspace"."workspaceId" = $1
        AND "userWorkspace"."deletedAt" IS NULL
        AND NOT EXISTS (SELECT 1 FROM ${schema}."workspaceMember" WHERE "workspaceMember"."userId" = "user"."id")
      ORDER BY "user"."id"
      LIMIT $2
      RETURNING "id", "userId"`,
    parameters: [workspaceId, count],
  });

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(workspaceId, ['flatWorkspaceMemberMaps']);

  const accessTokenService = getAppProviderByClassName<{
    generateAccessToken: (args: {
      userId: string;
      workspaceId: string;
      authProvider: AuthProviderEnum;
    }) => Promise<{ token: string }>;
  }>('AccessTokenService');

  const logins: AccessTestLogin[] = [];

  for (const { id: workspaceMemberId, userId } of workspaceMembers) {
    const { token } = await accessTokenService.generateAccessToken({
      userId,
      workspaceId,
      authProvider: AuthProviderEnum.Password,
    });

    logins.push({ workspaceMemberId, userId, token });
  }

  return logins;
};

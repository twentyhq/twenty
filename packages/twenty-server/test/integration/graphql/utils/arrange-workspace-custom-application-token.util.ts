import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

// An application token of the seeded Apple workspace's custom application, bound to Jane or to no user
export const arrangeWorkspaceCustomApplicationToken = async ({
  isBoundToUser,
}: {
  isBoundToUser: boolean;
}): Promise<string> => {
  const [{ workspaceCustomApplicationId }] =
    await globalThis.testDataSource.query(
      'SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1',
      [SEED_APPLE_WORKSPACE_ID],
    );

  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId: workspaceCustomApplicationId,
    ...(isBoundToUser
      ? {
          userId: USER_DATA_SEED_IDS.JANE,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        }
      : {}),
  });

  return applicationAccessToken.token;
};

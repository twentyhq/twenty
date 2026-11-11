import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const invalidateRoleTargets = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatRoleTargetMaps']);

export const removeApplicationGrantRoleTarget = async ({
  applicationId,
}: {
  applicationId: string;
}): Promise<() => Promise<void>> => {
  const removedRoleTargets: Record<string, unknown>[] =
    await globalThis.testDataSource.query(
      `SELECT * FROM core."roleTarget"
       WHERE "targetApplicationId" = $1 AND "workspaceId" = $2`,
      [applicationId, SEED_APPLE_WORKSPACE_ID],
    );

  await globalThis.testDataSource.query(
    `DELETE FROM core."roleTarget"
     WHERE "targetApplicationId" = $1 AND "workspaceId" = $2`,
    [applicationId, SEED_APPLE_WORKSPACE_ID],
  );

  await invalidateRoleTargets();

  return async () => {
    for (const removedRoleTarget of removedRoleTargets) {
      await globalThis.testDataSource.query(
        `INSERT INTO core."roleTarget"
         SELECT * FROM json_populate_record(NULL::core."roleTarget", $1::json)`,
        [JSON.stringify(removedRoleTarget)],
      );
    }

    await invalidateRoleTargets();
  };
};

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type ViewRowTableName =
  | 'view'
  | 'viewFilter'
  | 'viewFilterGroup'
  | 'viewGroup'
  | 'viewSort';

// The API only destroys these rows, so a soft-deleted one has to be written
// directly, then the flat cache told about it
export const setViewRowDeletedAt = async ({
  tableName,
  id,
  deletedAt,
}: {
  tableName: ViewRowTableName;
  id: string;
  deletedAt: Date | null;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `UPDATE core."${tableName}" SET "deletedAt" = $2 WHERE id = $1`,
    [id, deletedAt],
  );
  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatViewMaps',
    'flatViewFilterMaps',
    'flatViewFilterGroupMaps',
    'flatViewGroupMaps',
    'flatViewSortMaps',
  ]);
};

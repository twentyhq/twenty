import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';

// Teardowns resync instead of wiping the groups: records of every object keep
// the compact ids the sync stamped, and later specs share this workspace
export const restoreWorkspaceAccessGroups = async ({
  workspaceId,
  recomputedObjectNamesSingular,
}: {
  workspaceId: string;
  recomputedObjectNamesSingular: string[];
}): Promise<void> => {
  await getAppProviderByClassName<AccessGroupSyncService>(
    'AccessGroupSyncService',
  ).syncAccessGroups({ workspaceId });

  const recomputedObjectMetadata: { id: string }[] =
    await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = ANY($2)`,
      [workspaceId, recomputedObjectNamesSingular],
    );

  for (const { id: objectMetadataId } of recomputedObjectMetadata) {
    await getAppProviderByClassName<RecordAccessGroupComputationService>(
      'RecordAccessGroupComputationService',
    ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
      workspaceId,
      objectMetadataId,
    });
  }

  await waitForAllJobsToFinish();
};

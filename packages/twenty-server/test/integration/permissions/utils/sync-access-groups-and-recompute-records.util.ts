import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const syncAccessGroupsAndRecomputeRecords = async ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}): Promise<void> => {
  await waitForAllJobsToFinish();
  await getAppProviderByClassName<AccessGroupSyncService>(
    'AccessGroupSyncService',
  ).syncAccessGroups({ workspaceId: SEED_APPLE_WORKSPACE_ID });
  await getAppProviderByClassName<RecordAccessGroupComputationService>(
    'RecordAccessGroupComputationService',
  ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    objectMetadataId,
  });
  await waitForAllJobsToFinish();
};

import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { type ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const AGENT_CHAT_OBJECT_NAMES = [
  'agentChatThread',
  'agentChatThreadParticipant',
  'agentChatThreadTarget',
];

export const syncAgentChatAccessRules = async () => {
  await getAppProviderByClassName<MetadataEventEmitter>(
    'MetadataEventEmitter',
  ).drain();
  await waitForAllJobsToFinish();
  await getAppProviderByClassName<ChannelVisibilityRuleSyncService>(
    'ChannelVisibilityRuleSyncService',
  ).syncWorkspace(SEED_APPLE_WORKSPACE_ID);
  await getAppProviderByClassName<AccessGroupSyncService>(
    'AccessGroupSyncService',
  ).syncAccessGroups({ workspaceId: SEED_APPLE_WORKSPACE_ID });

  const recordAccessGroupComputationService =
    getAppProviderByClassName<RecordAccessGroupComputationService>(
      'RecordAccessGroupComputationService',
    );

  for (const objectName of AGENT_CHAT_OBJECT_NAMES) {
    await recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfAllObjectRecords(
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: await findObjectMetadataIdByName(objectName),
      },
    );
  }
  await waitForAllJobsToFinish();
};

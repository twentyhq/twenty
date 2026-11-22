import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CHANNEL_OBJECT_NAMES = [
  'message',
  'messageChannelMessageAssociation',
  'messageChannelMessageAssociationMessageFolder',
  'messageThread',
  'messageParticipant',
  'attachment',
  'calendarEvent',
  'calendarChannelEventAssociation',
  'calendarEventParticipant',
];

export const syncChannelVisibilityRules = async () => {
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

  for (const objectName of CHANNEL_OBJECT_NAMES) {
    await recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfAllObjectRecords(
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: await findObjectMetadataIdByName(objectName),
      },
    );
  }
};

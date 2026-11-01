import { type MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

// A raw repository delete skips the deletion event, so the channel's messages
// stay behind as orphans that later suites see masked.
export const deleteMessageChannel = async (
  messageChannelId: string,
): Promise<void> => {
  await getAppProviderByClassName<MessageChannelMetadataService>(
    'MessageChannelMetadataService',
  ).delete({ id: messageChannelId, workspaceId: SEED_APPLE_WORKSPACE_ID });

  await waitForAllJobsToFinish();
};

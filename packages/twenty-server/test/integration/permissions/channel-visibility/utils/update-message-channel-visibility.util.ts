import { syncChannelVisibilityRules } from 'test/integration/permissions/channel-visibility/utils/sync-channel-visibility-rules.util';
import { updateMessageChannelVisibilityWithMemberRole } from 'test/integration/utils/update-message-channel-visibility-with-member-role.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

export const updateMessageChannelVisibility = async ({
  messageChannelId,
  visibility,
}: {
  messageChannelId: string;
  visibility: string;
}) => {
  await updateMessageChannelVisibilityWithMemberRole({
    messageChannelId,
    visibility,
  });
  await syncChannelVisibilityRules();
  await waitForAllJobsToFinish();
};

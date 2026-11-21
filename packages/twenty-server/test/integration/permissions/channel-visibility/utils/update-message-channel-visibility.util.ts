import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { updateMessageChannelOperationFactory } from 'test/integration/permissions/channel-visibility/utils/update-message-channel-operation-factory.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

export const updateMessageChannelVisibility = async ({
  messageChannelId,
  visibility,
}: {
  messageChannelId: string;
  visibility: string;
}) => {
  const response = await makeMetadataApiRequestWithMemberRole(
    updateMessageChannelOperationFactory({ messageChannelId, visibility }),
  );

  expect(response.body.errors).toBeUndefined();
  await waitForAllJobsToFinish();
};

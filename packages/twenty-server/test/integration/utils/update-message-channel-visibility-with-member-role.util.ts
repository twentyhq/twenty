import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { updateMessageChannelQueryFactory } from 'test/integration/utils/update-message-channel-query-factory.util';

export const updateMessageChannelVisibilityWithMemberRole = async ({
  messageChannelId,
  visibility,
}: {
  messageChannelId: string;
  visibility: string;
}): Promise<void> => {
  const response = await makeMetadataApiRequestWithMemberRole(
    updateMessageChannelQueryFactory({ messageChannelId, visibility }),
  );

  expect(response.body.errors).toBeUndefined();
};

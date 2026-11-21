import { gql } from 'graphql-tag';
import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

export const updateMessageChannelVisibility = async ({
  messageChannelId,
  visibility,
}: {
  messageChannelId: string;
  visibility: string;
}) => {
  const response = await makeMetadataApiRequestWithMemberRole({
    query: gql`
      mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
        updateMessageChannel(input: $input) {
          visibility
        }
      }
    `,
    variables: { input: { id: messageChannelId, update: { visibility } } },
  });

  expect(response.body.errors).toBeUndefined();
  await waitForAllJobsToFinish();
};

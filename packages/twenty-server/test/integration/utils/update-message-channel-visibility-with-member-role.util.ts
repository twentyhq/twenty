import { gql } from 'graphql-tag';
import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';

export const updateMessageChannelVisibilityWithMemberRole = async ({
  messageChannelId,
  visibility,
}: {
  messageChannelId: string;
  visibility: string;
}): Promise<void> => {
  const response = await makeMetadataApiRequestWithMemberRole({
    query: gql`
      mutation UpdateMessageChannelVisibility(
        $input: UpdateMessageChannelInput!
      ) {
        updateMessageChannel(input: $input) {
          visibility
        }
      }
    `,
    variables: {
      input: { id: messageChannelId, update: { visibility } },
    },
  });

  expect(response.body.errors).toBeUndefined();
};

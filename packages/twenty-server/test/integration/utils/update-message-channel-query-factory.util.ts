import gql from 'graphql-tag';

export const updateMessageChannelQueryFactory = ({
  messageChannelId,
  visibility,
}: {
  messageChannelId: string;
  visibility: string;
}) => ({
  query: gql`
    mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
      updateMessageChannel(input: $input) {
        visibility
      }
    }
  `,
  variables: {
    input: { id: messageChannelId, update: { visibility } },
  },
});

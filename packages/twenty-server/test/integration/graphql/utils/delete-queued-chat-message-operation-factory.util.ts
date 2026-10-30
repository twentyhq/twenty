import gql from 'graphql-tag';

export const deleteQueuedChatMessageOperationFactory = ({
  messageId,
}: {
  messageId: string;
}) => ({
  query: gql`
    mutation DeleteSharedQueuedMessage($messageId: UUID!) {
      deleteQueuedChatMessage(messageId: $messageId)
    }
  `,
  variables: { messageId },
});

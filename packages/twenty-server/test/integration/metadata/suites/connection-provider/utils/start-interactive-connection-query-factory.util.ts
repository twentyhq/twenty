import gql from 'graphql-tag';

export const startInteractiveConnectionQueryFactory = ({
  input,
}: {
  input: {
    applicationId: string;
    providerName: string;
    reconnectingConnectedAccountId?: string;
  };
}) => ({
  query: gql`
    mutation StartInteractiveConnection(
      $input: StartInteractiveConnectionInput!
    ) {
      startInteractiveConnection(input: $input) {
        status
        flowId
        screen
        connectedAccountId
      }
    }
  `,
  variables: { input },
});

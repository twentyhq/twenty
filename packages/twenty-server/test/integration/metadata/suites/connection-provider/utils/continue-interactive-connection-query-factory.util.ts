import gql from 'graphql-tag';

export const continueInteractiveConnectionQueryFactory = ({
  input,
}: {
  input: {
    flowId: string;
    action: 'SUBMIT' | 'POLL' | 'CANCEL';
    values?: Record<string, string>;
  };
}) => ({
  query: gql`
    mutation ContinueInteractiveConnection(
      $input: ContinueInteractiveConnectionInput!
    ) {
      continueInteractiveConnection(input: $input) {
        status
        flowId
        screen
        connectedAccountId
      }
    }
  `,
  variables: { input },
});

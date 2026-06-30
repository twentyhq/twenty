import { gql } from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

export const getWorkflowStepConnectedAccountHandle = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}) => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      query WorkflowStepConnectedAccountHandle($connectedAccountId: UUID!) {
        workflowStepConnectedAccountHandle(
          connectedAccountId: $connectedAccountId
        ) {
          id
          handle
          provider
        }
      }
    `,
    variables: { connectedAccountId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workflowStepConnectedAccountHandle;
};

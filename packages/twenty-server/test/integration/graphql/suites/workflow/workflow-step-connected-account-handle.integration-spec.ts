import { gql } from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

const WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE_QUERY = gql`
  query WorkflowStepConnectedAccountHandle($connectedAccountId: UUID!) {
    workflowStepConnectedAccountHandle(connectedAccountId: $connectedAccountId) {
      id
      handle
      provider
    }
  }
`;

describe('workflowStepConnectedAccountHandle (e2e)', () => {
  it('should return handle for own account', async () => {
    const response = await makeGraphqlAPIRequest({
      query: WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE_QUERY,
      variables: {
        connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.workflowStepConnectedAccountHandle,
    ).toBeDefined();
    expect(
      response.body.data.workflowStepConnectedAccountHandle.handle,
    ).toBe('jane.austen@apple.dev');
  });

  it('should return handle for another user account in the same workspace', async () => {
    const response = await makeGraphqlAPIRequest({
      query: WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE_QUERY,
      variables: {
        connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.workflowStepConnectedAccountHandle,
    ).toBeDefined();
    expect(response.body.data.workflowStepConnectedAccountHandle.id).toBe(
      CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
    );
  });

  it('should return null for non-existent account', async () => {
    const response = await makeGraphqlAPIRequest({
      query: WORKFLOW_STEP_CONNECTED_ACCOUNT_HANDLE_QUERY,
      variables: {
        connectedAccountId: '00000000-0000-0000-0000-000000000000',
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.workflowStepConnectedAccountHandle,
    ).toBeNull();
  });
});

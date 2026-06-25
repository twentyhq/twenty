import { getWorkflowStepConnectedAccountHandle } from 'test/integration/graphql/suites/workflow/utils/get-workflow-step-connected-account-handle.util';

import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

describe('workflowStepConnectedAccountHandle', () => {
  it('should return handle for own account', async () => {
    const result = await getWorkflowStepConnectedAccountHandle({
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
    });

    expect(result).toBeDefined();
    expect(result.handle).toBe('jane.austen@apple.dev');
  });

  it('should return handle for another user account in the same workspace', async () => {
    const result = await getWorkflowStepConnectedAccountHandle({
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY);
  });

  it('should return null for non-existent account', async () => {
    const result = await getWorkflowStepConnectedAccountHandle({
      connectedAccountId: '00000000-0000-0000-0000-000000000000',
    });

    expect(result).toBeNull();
  });
});

import { getWorkflowUsageSpenderId } from 'src/modules/workflow/workflow-executor/utils/get-workflow-usage-spender-id.util';

describe('getWorkflowUsageSpenderId', () => {
  it('uses the workspace workflow id of a legacy workflow', () => {
    expect(
      getWorkflowUsageSpenderId({
        id: 'core-workflow-id',
        workspaceWorkflowId: 'workspace-workflow-id',
      }),
    ).toBe('workspace-workflow-id');
  });

  it('uses the core id of a workflow without a workspace twin', () => {
    expect(
      getWorkflowUsageSpenderId({
        id: 'core-workflow-id',
        workspaceWorkflowId: null,
      }),
    ).toBe('core-workflow-id');
  });
});

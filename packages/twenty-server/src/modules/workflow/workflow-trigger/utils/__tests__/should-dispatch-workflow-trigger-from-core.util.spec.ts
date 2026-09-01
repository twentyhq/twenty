import { shouldDispatchWorkflowTriggerFromCore } from 'src/modules/workflow/workflow-trigger/utils/should-dispatch-workflow-trigger-from-core.util';

describe('shouldDispatchWorkflowTriggerFromCore', () => {
  it('should dispatch from core when both version ids are present', () => {
    expect(
      shouldDispatchWorkflowTriggerFromCore({
        coreWorkflowVersionId: 'core-version-1',
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toBe(true);
  });

  it('should fall back when either version id is missing', () => {
    expect(
      shouldDispatchWorkflowTriggerFromCore({
        coreWorkflowVersionId: 'core-version-1',
        workspaceWorkflowVersionId: null,
      }),
    ).toBe(false);
    expect(
      shouldDispatchWorkflowTriggerFromCore({
        coreWorkflowVersionId: undefined,
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toBe(false);
    expect(shouldDispatchWorkflowTriggerFromCore({})).toBe(false);
  });
});

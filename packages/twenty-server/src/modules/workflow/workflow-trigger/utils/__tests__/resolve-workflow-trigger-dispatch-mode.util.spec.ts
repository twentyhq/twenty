import { resolveWorkflowTriggerDispatchMode } from 'src/modules/workflow/workflow-trigger/utils/resolve-workflow-trigger-dispatch-mode.util';

describe('resolveWorkflowTriggerDispatchMode', () => {
  it('should dispatch from core when both version ids are present', () => {
    expect(
      resolveWorkflowTriggerDispatchMode({
        coreWorkflowVersionId: 'core-version-1',
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toEqual({
      mode: 'CORE',
      coreWorkflowVersionId: 'core-version-1',
      workspaceWorkflowVersionId: 'workspace-version-1',
    });
  });

  it('should take the legacy path when both version ids are absent', () => {
    expect(resolveWorkflowTriggerDispatchMode({})).toEqual({ mode: 'LEGACY' });
    expect(
      resolveWorkflowTriggerDispatchMode({
        coreWorkflowVersionId: null,
        workspaceWorkflowVersionId: null,
      }),
    ).toEqual({ mode: 'LEGACY' });
  });

  it('should report a half resolved pair instead of downgrading it', () => {
    expect(
      resolveWorkflowTriggerDispatchMode({
        coreWorkflowVersionId: 'core-version-1',
      }),
    ).toEqual({ mode: 'INCOMPLETE' });
    expect(
      resolveWorkflowTriggerDispatchMode({
        workspaceWorkflowVersionId: 'workspace-version-1',
      }),
    ).toEqual({ mode: 'INCOMPLETE' });
  });
});

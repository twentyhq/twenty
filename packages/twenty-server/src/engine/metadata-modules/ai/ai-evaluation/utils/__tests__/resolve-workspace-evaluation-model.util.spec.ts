import { resolveWorkspaceEvaluationModelId } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/resolve-workspace-evaluation-model.util';

const INSTANCE_DEFAULT = 'typesafe-ai/jev-latest';

describe('resolveWorkspaceEvaluationModelId', () => {
  it('should honour a workspace pin that still resolves', () => {
    expect(
      resolveWorkspaceEvaluationModelId({
        workspacePinnedModelId: 'other/eval',
        isPinnedModelRunnable: true,
        isPinnedModelAdminAllowed: true,
        instanceDefaultModelId: INSTANCE_DEFAULT,
      }),
    ).toBe('other/eval');
  });

  it('should fall back to the instance default when the workspace pins nothing', () => {
    expect(
      resolveWorkspaceEvaluationModelId({
        workspacePinnedModelId: null,
        isPinnedModelRunnable: false,
        isPinnedModelAdminAllowed: false,
        instanceDefaultModelId: INSTANCE_DEFAULT,
      }),
    ).toBe(INSTANCE_DEFAULT);
  });

  // A step that named no model never asked for the pinned one, so a pin that
  // stopped resolving is not a reason to fail the run.
  it('should fall back when the pinned model is no longer runnable', () => {
    expect(
      resolveWorkspaceEvaluationModelId({
        workspacePinnedModelId: 'other/eval',
        isPinnedModelRunnable: false,
        isPinnedModelAdminAllowed: true,
        instanceDefaultModelId: INSTANCE_DEFAULT,
      }),
    ).toBe(INSTANCE_DEFAULT);
  });

  it('should not let a workspace pin outrank an administrator disabling the model', () => {
    expect(
      resolveWorkspaceEvaluationModelId({
        workspacePinnedModelId: 'other/eval',
        isPinnedModelRunnable: true,
        isPinnedModelAdminAllowed: false,
        instanceDefaultModelId: INSTANCE_DEFAULT,
      }),
    ).toBe(INSTANCE_DEFAULT);
  });

  // No evaluation model anywhere leaves the language-model fallback to decide,
  // which is what an undefined default means to the caller.
  it('should resolve to nothing when the instance offers no evaluation model', () => {
    expect(
      resolveWorkspaceEvaluationModelId({
        workspacePinnedModelId: '',
        isPinnedModelRunnable: false,
        isPinnedModelAdminAllowed: false,
        instanceDefaultModelId: undefined,
      }),
    ).toBeUndefined();
  });
});

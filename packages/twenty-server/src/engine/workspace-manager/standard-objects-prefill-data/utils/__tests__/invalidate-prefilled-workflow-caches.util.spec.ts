import { invalidatePrefilledWorkflowCaches } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/invalidate-prefilled-workflow-caches.util';

describe('invalidatePrefilledWorkflowCaches', () => {
  it('recomputes every workspace cache read by the workflow run path', async () => {
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);

    await invalidatePrefilledWorkflowCaches({
      workspaceId: 'workspace-id',
      workspaceCacheService: { invalidateAndRecompute },
    });

    expect(invalidateAndRecompute).toHaveBeenCalledTimes(1);
    expect(invalidateAndRecompute).toHaveBeenCalledWith('workspace-id', [
      'flatWorkflowMaps',
      'flatWorkflowVersionMaps',
      'workflowAutomatedTriggerMaps',
    ]);
  });
});

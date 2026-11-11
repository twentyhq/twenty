import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// prefillWorkflows inserts core rows directly, bypassing the services that keep
// these caches in sync. Call once its transaction has committed.
export const invalidatePrefilledWorkflowCaches = async ({
  workspaceId,
  workspaceCacheService,
}: {
  workspaceId: string;
  workspaceCacheService: Pick<WorkspaceCacheService, 'invalidateAndRecompute'>;
}): Promise<void> => {
  await workspaceCacheService.invalidateAndRecompute(workspaceId, [
    'flatWorkflowMaps',
    'flatWorkflowVersionMaps',
    'workflowAutomatedTriggerMaps',
  ]);
};

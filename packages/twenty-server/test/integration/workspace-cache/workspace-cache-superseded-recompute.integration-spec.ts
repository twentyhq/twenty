import { type WorkspaceWorkflowAutomatedTriggerMapCacheService } from 'src/engine/core-modules/workflow/services/workspace-workflow-automated-trigger-map-cache.service';
import { type WorkflowAutomatedTriggerMaps } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const STALE_WORKFLOW_ID = '20202020-5e1f-4c4e-9f3a-5a1e00000001';
const STALE_TRIGGER_MAPS: WorkflowAutomatedTriggerMaps = {
  byWorkflowId: {
    [STALE_WORKFLOW_ID]: {
      workflowId: STALE_WORKFLOW_ID,
      type: AutomatedTriggerType.DATABASE_EVENT,
      settings: { eventName: 'supersededRecompute.created' },
    },
  },
};

describe('Workspace cache recompute superseded by an invalidation', () => {
  let workspaceCacheService: WorkspaceCacheService;
  let triggerMapProvider: WorkspaceWorkflowAutomatedTriggerMapCacheService;

  beforeAll(() => {
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    triggerMapProvider =
      getAppProviderByClassName<WorkspaceWorkflowAutomatedTriggerMapCacheService>(
        'WorkspaceWorkflowAutomatedTriggerMapCacheService',
      );
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  });

  it('returns the superseded data to its caller without publishing it to the local cache or Redis', async () => {
    let resolveSupersededCompute: (
      triggerMaps: WorkflowAutomatedTriggerMaps,
    ) => void = () => {};
    let markSupersededComputeStarted: () => void = () => {};
    const supersededComputeStarted = new Promise<void>((resolve) => {
      markSupersededComputeStarted = resolve;
    });

    jest
      .spyOn(triggerMapProvider, 'computeForCache')
      .mockImplementationOnce(() => {
        markSupersededComputeStarted();

        return new Promise((resolve) => {
          resolveSupersededCompute = resolve;
        });
      });

    await workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);
    await workspaceCacheService.flush(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    const supersededRead = workspaceCacheService.getOrRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    await supersededComputeStarted;
    await workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    const hashesAfterInvalidation = await workspaceCacheService.getCacheHashes(
      workspaceId,
      ['workflowAutomatedTriggerMaps'],
    );

    expect(hashesAfterInvalidation.workflowAutomatedTriggerMaps).toBeDefined();

    resolveSupersededCompute(STALE_TRIGGER_MAPS);

    expect(await supersededRead).toEqual({
      workflowAutomatedTriggerMaps: STALE_TRIGGER_MAPS,
    });

    const { workflowAutomatedTriggerMaps: localTriggerMaps } =
      await workspaceCacheService.getOrRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);

    expect(localTriggerMaps.byWorkflowId[STALE_WORKFLOW_ID]).toBeUndefined();
    expect(
      await workspaceCacheService.getCacheHashes(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]),
    ).toEqual(hashesAfterInvalidation);

    await workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    expect(
      await workspaceCacheService.getOrRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]),
    ).toEqual({ workflowAutomatedTriggerMaps: localTriggerMaps });
  });
});

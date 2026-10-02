import { type WorkspaceFlatWorkspaceMemberMapCacheService } from 'src/engine/core-modules/user/services/workspace-flat-workspace-member-map-cache.service';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type WorkspaceWorkflowAutomatedTriggerMapCacheService } from 'src/engine/core-modules/workflow/services/workspace-workflow-automated-trigger-map-cache.service';
import { type WorkflowAutomatedTriggerMaps } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { type WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
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
const STALE_USER_ID = '20202020-5e1f-4c4e-9f3a-5a1e00000002';
const STALE_WORKSPACE_MEMBER_MAPS: FlatWorkspaceMemberMaps = {
  byId: {},
  idByUserId: { [STALE_USER_ID]: '20202020-5e1f-4c4e-9f3a-5a1e00000003' },
};

const deferNextComputeForCache = <
  TData extends FlatWorkspaceMemberMaps | WorkflowAutomatedTriggerMaps,
>(
  provider: WorkspaceCacheProvider<TData>,
) => {
  let resolveCompute: (data: TData) => void = () => {};
  let markComputeStarted: () => void = () => {};
  const computeStarted = new Promise<void>((resolve) => {
    markComputeStarted = resolve;
  });

  jest.spyOn(provider, 'computeForCache').mockImplementationOnce(() => {
    markComputeStarted();

    return new Promise<TData>((resolve) => {
      resolveCompute = resolve;
    });
  });

  return {
    computeStarted,
    resolveCompute: (data: TData) => resolveCompute(data),
  };
};

describe('Workspace cache recompute superseded by an invalidation', () => {
  let workspaceCacheService: WorkspaceCacheService;
  let triggerMapProvider: WorkspaceWorkflowAutomatedTriggerMapCacheService;
  let workspaceMemberMapProvider: WorkspaceFlatWorkspaceMemberMapCacheService;

  beforeAll(() => {
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    triggerMapProvider =
      getAppProviderByClassName<WorkspaceWorkflowAutomatedTriggerMapCacheService>(
        'WorkspaceWorkflowAutomatedTriggerMapCacheService',
      );
    workspaceMemberMapProvider =
      getAppProviderByClassName<WorkspaceFlatWorkspaceMemberMapCacheService>(
        'WorkspaceFlatWorkspaceMemberMapCacheService',
      );
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
      'flatWorkspaceMemberMaps',
    ]);
  });

  it('returns the superseded data to its caller without publishing it to the local cache or Redis', async () => {
    const { computeStarted, resolveCompute } =
      deferNextComputeForCache(triggerMapProvider);

    await workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);
    await workspaceCacheService.flush(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    const supersededRead = workspaceCacheService.getOrRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    await computeStarted;
    await workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    const hashesAfterInvalidation = await workspaceCacheService.getCacheHashes(
      workspaceId,
      ['workflowAutomatedTriggerMaps'],
    );

    expect(hashesAfterInvalidation.workflowAutomatedTriggerMaps).toBeDefined();

    resolveCompute(STALE_TRIGGER_MAPS);

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

  it('does not bootstrap the hash or cache the data of a superseded local-data-only recompute', async () => {
    const { computeStarted, resolveCompute } = deferNextComputeForCache(
      workspaceMemberMapProvider,
    );

    await workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);
    await workspaceCacheService.flush(workspaceId, ['flatWorkspaceMemberMaps']);

    const supersededRead = workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
    ]);

    await computeStarted;
    await workspaceCacheService.flush(workspaceId, ['flatWorkspaceMemberMaps']);

    resolveCompute(STALE_WORKSPACE_MEMBER_MAPS);

    expect(await supersededRead).toEqual({
      flatWorkspaceMemberMaps: STALE_WORKSPACE_MEMBER_MAPS,
    });
    expect(
      await workspaceCacheService.getCacheHashes(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]),
    ).toEqual({});

    const { flatWorkspaceMemberMaps: freshWorkspaceMemberMaps } =
      await workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    expect(freshWorkspaceMemberMaps.idByUserId[STALE_USER_ID]).toBeUndefined();
    expect(Object.keys(freshWorkspaceMemberMaps.byId).length).toBeGreaterThan(
      0,
    );
  });

  it('serves fresh data after a bare flush that superseded an in-flight read', async () => {
    const { computeStarted, resolveCompute } =
      deferNextComputeForCache(triggerMapProvider);

    await workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);
    await workspaceCacheService.flush(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    const supersededRead = workspaceCacheService.getOrRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    await computeStarted;
    await workspaceCacheService.flush(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);

    resolveCompute(STALE_TRIGGER_MAPS);

    expect(await supersededRead).toEqual({
      workflowAutomatedTriggerMaps: STALE_TRIGGER_MAPS,
    });

    const { workflowAutomatedTriggerMaps: freshTriggerMaps } =
      await workspaceCacheService.getOrRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);

    expect(freshTriggerMaps.byWorkflowId[STALE_WORKFLOW_ID]).toBeUndefined();
  });
});

import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

const WORKSPACE_ID = 'workspace-1';
const WORKFLOW_VERSION_ID = 'workflow-version-1';
const CORE_WORKFLOW_VERSION_ID = 'core-workflow-version-1';

const workspaceTrigger = { name: 'workspace trigger', type: 'MANUAL' };
const workspaceSteps = [{ id: 'workspace-step' }];

const coreTrigger = { name: 'core trigger', type: 'DATABASE_EVENT' };
const coreSteps = [{ id: 'core-step' }];

const buildService = ({
  isCoreReadEnabled,
  coreVersion = null,
  coreWorkflowVersionId = CORE_WORKFLOW_VERSION_ID,
}: {
  isCoreReadEnabled: boolean;
  coreVersion?: unknown;
  coreWorkflowVersionId?: string | null;
}) => {
  const workspaceVersion = {
    id: WORKFLOW_VERSION_ID,
    workflowId: 'workflow-1',
    name: 'Draft',
    trigger: workspaceTrigger,
    steps: workspaceSteps,
    status: 'DRAFT',
    coreWorkflowVersionId,
  };

  const isFeatureEnabled = jest.fn().mockResolvedValue(isCoreReadEnabled);
  const findCoreVersionById = jest.fn().mockResolvedValue(coreVersion);

  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: (fn: () => unknown) => fn(),
    getRepository: jest.fn().mockResolvedValue({
      findOne: jest.fn().mockResolvedValue(workspaceVersion),
    }),
  } as unknown as GlobalWorkspaceOrmManager;

  const service = new WorkflowCommonWorkspaceService(
    globalWorkspaceOrmManager,
    undefined as unknown as never,
    undefined as unknown as never,
    undefined as unknown as never,
    { findCoreVersionById } as unknown as WorkflowVersionCoreSyncService,
    { isFeatureEnabled } as unknown as FeatureFlagService,
  );

  return { service, isFeatureEnabled, findCoreVersionById };
};

describe('WorkflowCommonWorkspaceService', () => {
  describe('getWorkflowVersionOrFail core read overlay', () => {
    it('returns workspace content when the core read flag is off', async () => {
      const { service, isFeatureEnabled, findCoreVersionById } = buildService({
        isCoreReadEnabled: false,
      });

      const result = await service.getWorkflowVersionOrFail({
        workspaceId: WORKSPACE_ID,
        workflowVersionId: WORKFLOW_VERSION_ID,
      });

      expect(isFeatureEnabled).toHaveBeenCalledWith(
        FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED,
        WORKSPACE_ID,
      );
      expect(findCoreVersionById).not.toHaveBeenCalled();
      expect(result.trigger).toEqual(workspaceTrigger);
      expect(result.steps).toEqual(workspaceSteps);
      expect(result.status).toBe('DRAFT');
    });

    it('overlays trigger, steps and status from core when the flag is on and the core row exists', async () => {
      const { service, findCoreVersionById } = buildService({
        isCoreReadEnabled: true,
        coreVersion: {
          triggers: [coreTrigger],
          steps: coreSteps,
          status: 'ACTIVE',
        },
      });

      const result = await service.getWorkflowVersionOrFail({
        workspaceId: WORKSPACE_ID,
        workflowVersionId: WORKFLOW_VERSION_ID,
      });

      expect(findCoreVersionById).toHaveBeenCalledWith(
        WORKSPACE_ID,
        CORE_WORKFLOW_VERSION_ID,
      );
      expect(result.trigger).toEqual(coreTrigger);
      expect(result.steps).toEqual(coreSteps);
      expect(result.status).toBe('ACTIVE');

      // identity stays from the workspace row: core has neither of these
      expect(result.id).toBe(WORKFLOW_VERSION_ID);
      expect(result.name).toBe('Draft');
    });

    it('falls back to workspace content when the flag is on but the core row is missing', async () => {
      const { service } = buildService({
        isCoreReadEnabled: true,
        coreVersion: null,
      });

      const result = await service.getWorkflowVersionOrFail({
        workspaceId: WORKSPACE_ID,
        workflowVersionId: WORKFLOW_VERSION_ID,
      });

      expect(result.trigger).toEqual(workspaceTrigger);
      expect(result.steps).toEqual(workspaceSteps);
      expect(result.status).toBe('DRAFT');
    });

    it('skips the core read when the version has no soft-ref', async () => {
      const { service, findCoreVersionById } = buildService({
        isCoreReadEnabled: true,
        coreWorkflowVersionId: null,
      });

      const result = await service.getWorkflowVersionOrFail({
        workspaceId: WORKSPACE_ID,
        workflowVersionId: WORKFLOW_VERSION_ID,
      });

      expect(findCoreVersionById).not.toHaveBeenCalled();
      expect(result.trigger).toEqual(workspaceTrigger);
    });
  });
});

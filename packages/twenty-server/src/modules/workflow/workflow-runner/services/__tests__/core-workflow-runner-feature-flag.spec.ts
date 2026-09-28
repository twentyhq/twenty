jest.mock('src/modules/workflow/workflow-runner/jobs/run-workflow.job', () => ({
  RunWorkflowJob: class RunWorkflowJob {},
}));
import { Test } from '@nestjs/testing';
import { FieldActorSource } from 'twenty-shared/types';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const INPUT = {
  workspaceId: 'workspace',
  coreWorkflowVersionId: 'version',
  payload: {},
  source: {
    source: FieldActorSource.MANUAL,
    name: 'User',
    workspaceMemberId: null,
    context: {},
  },
};

describe('application workflow execution gate', () => {
  const isFeatureEnabled = jest.fn();
  const findCoreWorkflowById = jest.fn();
  const findCoreVersionById = jest.fn();
  const createCoreWorkflowRun = jest.fn();
  let service: CoreWorkflowRunnerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CoreWorkflowRunnerService,
        { provide: FeatureFlagService, useValue: { isFeatureEnabled } },
        {
          provide: WorkflowCoreSyncService,
          useValue: { findCoreWorkflowById },
        },
        {
          provide: WorkflowVersionCoreSyncService,
          useValue: { findCoreVersionById },
        },
        {
          provide: WorkflowRunWorkspaceService,
          useValue: { createCoreWorkflowRun },
        },
        {
          provide: BillingUsageService,
          useValue: { getSubscriptionInactiveReason: jest.fn() },
        },
        {
          provide: WorkflowThrottlingWorkspaceService,
          useValue: { throttleOrThrowIfHardLimitReached: jest.fn() },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();
    service = module.get(CoreWorkflowRunnerService);
    findCoreWorkflowById.mockResolvedValue({
      id: 'workflow',
      workspaceWorkflowId: null,
    });
    findCoreVersionById.mockResolvedValue({
      id: 'version',
      coreWorkflowId: 'workflow',
      workflowId: null,
      workspaceWorkflowVersionId: null,
      triggers: [{ type: 'MANUAL' }],
      steps: [],
    });
    isFeatureEnabled.mockResolvedValue(false);
    createCoreWorkflowRun.mockRejectedValue(new Error('Reached run creation'));
  });

  it('blocks a new application workflow run before creating or enqueueing it', async () => {
    await expect(service.run(INPUT)).rejects.toThrow(
      'Application workflows are not enabled',
    );
    expect(createCoreWorkflowRun).not.toHaveBeenCalled();
  });

  it('allows new application runs when enabled', async () => {
    isFeatureEnabled.mockResolvedValue(true);
    await expect(service.run(INPUT)).rejects.toThrow('Reached run creation');
    expect(createCoreWorkflowRun).toHaveBeenCalled();
  });

  it('does not gate existing workspace-backed workflows', async () => {
    findCoreWorkflowById.mockResolvedValue({
      id: 'workflow',
      workspaceWorkflowId: 'workspace-workflow',
    });
    findCoreVersionById.mockResolvedValue({
      id: 'version',
      coreWorkflowId: 'workflow',
      workflowId: 'workspace-workflow',
      workspaceWorkflowVersionId: 'workspace-version',
      triggers: [{ type: 'MANUAL' }],
      steps: [],
    });
    await expect(service.run(INPUT)).rejects.toThrow('Reached run creation');
    expect(isFeatureEnabled).not.toHaveBeenCalled();
  });
});

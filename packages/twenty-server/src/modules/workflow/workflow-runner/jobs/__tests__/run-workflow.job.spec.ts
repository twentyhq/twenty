import { Test, type TestingModule } from '@nestjs/testing';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

describe('RunWorkflowJob', () => {
  let job: RunWorkflowJob;
  let workflowRunWorkspaceService: jest.Mocked<WorkflowRunWorkspaceService>;
  let workflowCommonWorkspaceService: jest.Mocked<WorkflowCommonWorkspaceService>;
  let workflowExecutorWorkspaceService: jest.Mocked<WorkflowExecutorWorkspaceService>;
  let codeStepBuildService: jest.Mocked<CodeStepBuildService>;
  let metricsService: jest.Mocked<MetricsService>;

  const workflowRunId = 'workflow-run-1';
  const workspaceId = 'workspace-1';
  const workflowVersionId = 'workflow-version-1';

  const workflowVersion = {
    trigger: { type: WorkflowTriggerType.MANUAL, nextStepIds: ['step-1'] },
    steps: [{ id: 'step-1' }],
  };

  beforeEach(async () => {
    workflowRunWorkspaceService = {
      getWorkflowRunOrFail: jest
        .fn()
        .mockResolvedValue({
          status: WorkflowRunStatus.ENQUEUED,
          workflowVersionId,
        }),
      startWorkflowRun: jest.fn(),
      endWorkflowRun: jest.fn(),
    } as any;

    workflowCommonWorkspaceService = {
      getWorkflowVersionOrFail: jest.fn().mockResolvedValue(workflowVersion),
    } as any;

    workflowExecutorWorkspaceService = {
      executeFromSteps: jest.fn(),
    } as any;

    codeStepBuildService = {
      buildCodeStepsFromSourceForSteps: jest.fn(),
    } as any;

    metricsService = {
      incrementCounterForEvent: jest.fn(),
    } as any;

    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback: () => Promise<void>) =>
        callback(),
      ),
    } as unknown as GlobalWorkspaceOrmManager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RunWorkflowJob,
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: workflowCommonWorkspaceService,
        },
        { provide: CodeStepBuildService, useValue: codeStepBuildService },
        {
          provide: WorkflowExecutorWorkspaceService,
          useValue: workflowExecutorWorkspaceService,
        },
        {
          provide: WorkflowRunWorkspaceService,
          useValue: workflowRunWorkspaceService,
        },
        { provide: MetricsService, useValue: metricsService },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    job = await module.resolve<RunWorkflowJob>(RunWorkflowJob);
  });

  it('executes the workflow steps when it wins the start race', async () => {
    workflowRunWorkspaceService.startWorkflowRun.mockResolvedValue(true);

    await job.handle({ workflowRunId, workspaceId });

    expect(
      workflowExecutorWorkspaceService.executeFromSteps,
    ).toHaveBeenCalledWith({
      stepIds: ['step-1'],
      workflowRunId,
      workspaceId,
    });
    expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
  });

  it('bails out without failing the run when another job already started it', async () => {
    // Simulate the TOCTOU race: the unlocked pre-check still sees ENQUEUED,
    // but by the time the locked startWorkflowRun runs another job has already
    // moved the run to RUNNING, so it returns false.
    workflowRunWorkspaceService.startWorkflowRun.mockResolvedValue(false);

    await job.handle({ workflowRunId, workspaceId });

    // The late job must not execute steps...
    expect(
      workflowExecutorWorkspaceService.executeFromSteps,
    ).not.toHaveBeenCalled();
    // ...and must NOT end the run that the winning job is actively executing
    // (this is what produced "Workflow has been ended before this step was
    // completed" on a RUNNING iterator step).
    expect(workflowRunWorkspaceService.endWorkflowRun).not.toHaveBeenCalled();
  });
});

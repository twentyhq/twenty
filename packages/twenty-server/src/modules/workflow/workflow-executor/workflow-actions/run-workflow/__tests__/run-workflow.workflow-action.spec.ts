import { Test, type TestingModule } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

// WorkflowRunnerWorkspaceService pulls in RunWorkflowJob ->
// WorkflowExecutorWorkspaceService -> WorkflowActionFactory, which
// requires this very module (RunWorkflowWorkflowAction) as part of the
// WorkflowRunnerModule -> WorkflowExecutorModule -> RunWorkflowActionModule
// -> WorkflowRunnerModule cycle. Importing the real module here would hit
// that cycle mid-evaluation and throw a TDZ error; mock it so this spec
// only needs the class reference as a DI token.
jest.mock(
  'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service',
);

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { RunWorkflowWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/run-workflow/run-workflow.workflow-action';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

const baseSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};

const buildRunWorkflowStep = (input: Record<string, unknown>): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType.RUN_WORKFLOW,
    name: 'Run workflow',
    valid: true,
    settings: { ...baseSettings, input },
  }) as WorkflowAction;

describe('RunWorkflowWorkflowAction', () => {
  let action: RunWorkflowWorkflowAction;
  let workflowRepository: { findOneBy: jest.Mock };
  let workflowRunRepository: { findOneBy: jest.Mock };
  let workflowCommonWorkspaceService: { getWorkflowVersionOrFail: jest.Mock };
  let workflowRunnerWorkspaceService: { run: jest.Mock };

  const calleeWorkflow = {
    id: 'callee-workflow-1',
    name: 'Callee workflow',
    lastPublishedVersionId: 'version-1',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    workflowRepository = { findOneBy: jest.fn() };
    workflowRunRepository = { findOneBy: jest.fn() };
    workflowCommonWorkspaceService = { getWorkflowVersionOrFail: jest.fn() };
    workflowRunnerWorkspaceService = {
      run: jest.fn().mockResolvedValue({ workflowRunId: 'child-run-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RunWorkflowWorkflowAction,
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn((callback) => callback()),
            getRepository: jest.fn((entityName: string) =>
              entityName === 'workflow'
                ? workflowRepository
                : workflowRunRepository,
            ),
          },
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: workflowCommonWorkspaceService,
        },
        {
          provide: WorkflowRunnerWorkspaceService,
          useValue: workflowRunnerWorkspaceService,
        },
      ],
    }).compile();

    action = module.get(RunWorkflowWorkflowAction);

    workflowRepository.findOneBy.mockResolvedValue(calleeWorkflow);
    workflowRunRepository.findOneBy.mockResolvedValue(null);
    workflowCommonWorkspaceService.getWorkflowVersionOrFail.mockResolvedValue({
      status: WorkflowVersionStatus.ACTIVE,
    });
  });

  const executeWithInput = (
    input: Record<string, unknown>,
    trigger: Record<string, unknown> = {},
  ) =>
    action.execute({
      currentStepId: 'step-1',
      steps: [buildRunWorkflowStep(input)],
      context: { trigger },
      runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
    });

  it('returns the child workflowRunId and stamps runDepth + 1 on the child payload', async () => {
    const result = await executeWithInput(
      { workflowId: calleeWorkflow.id, input: { foo: 'bar' } },
      { metadata: { runDepth: 2 } },
    );

    expect(result).toEqual({ result: { workflowRunId: 'child-run-1' } });
    expect(workflowRunnerWorkspaceService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-1',
        workflowVersionId: calleeWorkflow.lastPublishedVersionId,
        payload: { foo: 'bar', metadata: { runDepth: 3 } },
      }),
    );
  });

  it('defaults to depth 0 when the trigger payload has no runDepth', async () => {
    await executeWithInput({ workflowId: calleeWorkflow.id, input: {} }, {});

    expect(workflowRunnerWorkspaceService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ metadata: { runDepth: 1 } }),
      }),
    );
  });

  it('throws NO_ACTIVE_WORKFLOW_VERSION when the callee workflow is not found', async () => {
    workflowRepository.findOneBy.mockResolvedValue(null);

    await expect(
      executeWithInput({ workflowId: 'missing-workflow', input: {} }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
    });
    expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('throws NO_ACTIVE_WORKFLOW_VERSION when the callee has no published version', async () => {
    workflowRepository.findOneBy.mockResolvedValue({
      ...calleeWorkflow,
      lastPublishedVersionId: null,
    });

    await expect(
      executeWithInput({ workflowId: calleeWorkflow.id, input: {} }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
    });
    expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('throws NO_ACTIVE_WORKFLOW_VERSION when the published version is DEACTIVATED', async () => {
    workflowCommonWorkspaceService.getWorkflowVersionOrFail.mockResolvedValue({
      status: WorkflowVersionStatus.DEACTIVATED,
    });

    await expect(
      executeWithInput({ workflowId: calleeWorkflow.id, input: {} }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
    });
    expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  describe('run depth guard', () => {
    it('allows a chain at the max depth', async () => {
      await executeWithInput(
        { workflowId: calleeWorkflow.id, input: {} },
        { metadata: { runDepth: 4 } },
      );

      expect(workflowRunnerWorkspaceService.run).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ metadata: { runDepth: 5 } }),
        }),
      );
    });

    it('throws WORKFLOW_RUN_DEPTH_EXCEEDED once the next hop exceeds the cap', async () => {
      await expect(
        executeWithInput(
          { workflowId: calleeWorkflow.id, input: {} },
          { metadata: { runDepth: 5 } },
        ),
      ).rejects.toMatchObject({
        code: WorkflowStepExecutorExceptionCode.WORKFLOW_RUN_DEPTH_EXCEEDED,
      });
      expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
    });

    it.each([
      ['a non-numeric string', 'x'],
      ['a negative number', -1000000],
      ['a float', 1.5],
      ['NaN', Number.NaN],
    ])(
      'rejects %s runDepth from the trigger payload',
      async (_label, runDepth) => {
        await expect(
          executeWithInput(
            { workflowId: calleeWorkflow.id, input: {} },
            { metadata: { runDepth } },
          ),
        ).rejects.toMatchObject({
          code: WorkflowStepExecutorExceptionCode.WORKFLOW_RUN_DEPTH_EXCEEDED,
        });
        expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
      },
    );
  });

  it('rejects a mapped input that tries to set the reserved metadata key', async () => {
    await expect(
      executeWithInput({
        workflowId: calleeWorkflow.id,
        input: { metadata: { spoofed: true } },
      }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    });
    expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('throws INVALID_STEP_TYPE when the current step is not a run-workflow action', async () => {
    await expect(
      action.execute({
        currentStepId: 'step-1',
        steps: [
          {
            ...buildRunWorkflowStep({
              workflowId: calleeWorkflow.id,
              input: {},
            }),
            type: WorkflowActionType.DELAY,
          } as WorkflowAction,
        ],
        context: {},
        runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
      }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
    });
    expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('propagates infrastructure errors from getWorkflowVersionOrFail instead of masking them', async () => {
    const infraError = new Error('DB connection lost');

    workflowCommonWorkspaceService.getWorkflowVersionOrFail.mockRejectedValue(
      infraError,
    );

    await expect(
      executeWithInput({ workflowId: calleeWorkflow.id, input: {} }),
    ).rejects.toBe(infraError);
    expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('collapses a WorkflowTriggerException from getWorkflowVersionOrFail into NO_ACTIVE_WORKFLOW_VERSION', async () => {
    workflowCommonWorkspaceService.getWorkflowVersionOrFail.mockRejectedValue(
      new WorkflowTriggerException(
        'missing version',
        WorkflowTriggerExceptionCode.NOT_FOUND,
      ),
    );

    await expect(
      executeWithInput({ workflowId: calleeWorkflow.id, input: {} }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
    });
    expect(workflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });
});

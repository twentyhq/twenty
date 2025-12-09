import { Test, type TestingModule } from '@nestjs/testing';

import { getWorkflowRunContext, StepStatus } from 'twenty-shared/workflow';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE } from 'src/engine/core-modules/billing/constants/billing-workflow-execution-error-message.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

jest.mock(
  'src/modules/workflow/workflow-executor/utils/should-execute-step.util',
  () => {
    const actual = jest.requireActual(
      'src/modules/workflow/workflow-executor/utils/should-execute-step.util',
    );

    return {
      ...actual,
      shouldExecuteStep: jest.fn().mockReturnValue(true), // default behavior
    };
  },
);

describe('WorkflowExecutorWorkspaceService', () => {
  let service: WorkflowExecutorWorkspaceService;
  let workflowActionFactory: WorkflowActionFactory;
  let workspaceEventEmitter: WorkspaceEventEmitter;
  let workflowRunWorkspaceService: WorkflowRunWorkspaceService;

  const mockWorkflowExecutor = {
    execute: jest.fn().mockResolvedValue({ result: { success: true } }),
  };

  const mockWorkspaceEventEmitter = {
    emitCustomBatchEvent: jest.fn(),
  };

  const mockWorkflowRunWorkspaceService = {
    endWorkflowRun: jest.fn(),
    updateWorkflowRunStepInfo: jest.fn(),
    getWorkflowRunOrFail: jest.fn(),
  };

  const mockBillingService = {
    isBillingEnabled: jest.fn().mockReturnValue(true),
    canBillMeteredProduct: jest.fn().mockReturnValue(true),
  };

  const mockMessageQueueService = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowExecutorWorkspaceService,
        {
          provide: WorkflowActionFactory,
          useValue: {
            get: jest.fn().mockReturnValue(mockWorkflowExecutor),
          },
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: mockWorkspaceEventEmitter,
        },
        {
          provide: WorkflowRunWorkspaceService,
          useValue: mockWorkflowRunWorkspaceService,
        },
        {
          provide: BillingService,
          useValue: mockBillingService,
        },
        {
          provide: `MESSAGE_QUEUE_${MessageQueue.workflowQueue}`,
          useValue: mockMessageQueueService,
        },
      ],
    }).compile();

    service = module.get<WorkflowExecutorWorkspaceService>(
      WorkflowExecutorWorkspaceService,
    );
    workflowActionFactory = module.get<WorkflowActionFactory>(
      WorkflowActionFactory,
    );
    workspaceEventEmitter = module.get<WorkspaceEventEmitter>(
      WorkspaceEventEmitter,
    );
    workflowRunWorkspaceService = module.get<WorkflowRunWorkspaceService>(
      WorkflowRunWorkspaceService,
    );
  });

  describe('execute', () => {
    const mockWorkflowRunId = 'workflow-run-id';
    const mockWorkspaceId = 'workspace-id';
    const mockSteps = [
      {
        id: 'step-1',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
        nextStepIds: ['step-2'],
      },
      {
        id: 'step-2',
        type: WorkflowActionType.SEND_EMAIL,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
        nextStepIds: [],
      },
    ] as WorkflowAction[];

    const mockStepInfos = {
      trigger: { result: {}, status: StepStatus.SUCCESS },
      'step-1': { status: StepStatus.NOT_STARTED },
      'step-2': { status: StepStatus.NOT_STARTED },
    };

    mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockReturnValue({
      state: { flow: { steps: mockSteps }, stepInfos: mockStepInfos },
      workflowId: 'workflow-id',
    });

    it('should execute a step and continue to the next step on success', async () => {
      const mockStepResult = {
        result: { stepOutput: 'success' },
      };

      mockWorkflowExecutor.execute.mockResolvedValueOnce(mockStepResult);

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      expect(workflowActionFactory.get).toHaveBeenCalledWith(
        WorkflowActionType.CODE,
      );

      expect(mockWorkflowExecutor.execute).toHaveBeenCalledWith({
        currentStepId: 'step-1',
        steps: mockSteps,
        context: getWorkflowRunContext(mockStepInfos),
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      });

      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        BILLING_FEATURE_USED,
        [
          {
            eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
            value: 1,
            dimensions: {
              execution_type: 'workflow_execution',
              resource_id: 'workflow-id',
              execution_context_1: null,
            },
          },
        ],
        'workspace-id',
      );

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenCalledTimes(4);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenNthCalledWith(1, {
        stepId: 'step-1',
        stepInfo: {
          status: StepStatus.RUNNING,
        },
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
      });

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenNthCalledWith(2, {
        stepId: 'step-1',
        stepInfo: {
          ...mockStepResult,
          status: StepStatus.SUCCESS,
        },
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
      });

      // execute second step
      expect(workflowActionFactory.get).toHaveBeenCalledWith(
        WorkflowActionType.SEND_EMAIL,
      );
    });

    it('should handle step execution errors', async () => {
      mockWorkflowExecutor.execute.mockRejectedValueOnce(
        new Error('Step execution failed'),
      );

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenCalledTimes(2);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenNthCalledWith(1, {
        stepId: 'step-1',
        stepInfo: {
          status: StepStatus.RUNNING,
        },
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
      });

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenNthCalledWith(2, {
        stepId: 'step-1',
        stepInfo: {
          error: 'Step execution failed',
          status: StepStatus.FAILED,
        },
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
      });
    });

    it('should handle pending events', async () => {
      const mockPendingEvent = {
        pendingEvent: true,
      };

      mockWorkflowExecutor.execute.mockResolvedValueOnce(mockPendingEvent);

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenCalledTimes(2);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenNthCalledWith(1, {
        stepId: 'step-1',
        stepInfo: {
          status: StepStatus.RUNNING,
        },
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
      });

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenNthCalledWith(2, {
        stepId: 'step-1',
        stepInfo: {
          status: StepStatus.PENDING,
        },
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
      });

      // No recursive call to execute should happen
      expect(workflowActionFactory.get).not.toHaveBeenCalledWith(
        WorkflowActionType.SEND_EMAIL,
      );
    });

    it('should stop when billing validation fails', async () => {
      mockBillingService.isBillingEnabled.mockReturnValueOnce(true);
      mockBillingService.canBillMeteredProduct.mockReturnValueOnce(false);

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      expect(workflowActionFactory.get).toHaveBeenCalledTimes(0);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenCalledTimes(1);

      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledTimes(
        1,
      );

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfo,
      ).toHaveBeenCalledWith({
        stepId: 'step-1',
        stepInfo: {
          error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
          status: StepStatus.FAILED,
        },
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
      });
    });

    it('should return if step should not be executed', async () => {
      (shouldExecuteStep as jest.Mock).mockReturnValueOnce(false);

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      expect(workflowActionFactory.get).not.toHaveBeenCalled();
    });

    it('should queue another job when max executed step count is reached', async () => {
      const mockStepResult = {
        result: { stepOutput: 'success' },
      };

      mockWorkflowExecutor.execute.mockResolvedValueOnce(mockStepResult);

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
        executedStepsCount: 21, // exceeds MAX_EXECUTED_STEPS_COUNT (20)
      });

      expect(mockMessageQueueService.add).toHaveBeenCalledWith(
        'RunWorkflowJob',
        {
          workspaceId: mockWorkspaceId,
          workflowRunId: mockWorkflowRunId,
          lastExecutedStepId: 'step-1',
        },
      );

      // Should not execute the next step (step-2) in the same job
      expect(workflowActionFactory.get).toHaveBeenCalledTimes(1);
      expect(workflowActionFactory.get).toHaveBeenCalledWith(
        WorkflowActionType.CODE,
      );
    });
  });

  describe('sendWorkflowNodeRunEvent', () => {
    it('should emit a billing event', () => {
      service['sendWorkflowNodeRunEvent']('workspace-id', 'workflow-id');

      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        BILLING_FEATURE_USED,
        [
          {
            eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
            value: 1,
            dimensions: {
              execution_type: 'workflow_execution',
              resource_id: 'workflow-id',
              execution_context_1: null,
            },
          },
        ],
        'workspace-id',
      );
    });
  });
});

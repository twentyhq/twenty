import { Test, TestingModule } from '@nestjs/testing';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE } from 'src/engine/core-modules/billing/constants/billing-workflow-execution-error-message.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { StepStatus } from 'src/modules/workflow/workflow-executor/types/workflow-run-step-info.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { canExecuteStep } from 'src/modules/workflow/workflow-executor/utils/can-execute-step.utils';

jest.mock(
  'src/modules/workflow/workflow-executor/utils/can-execute-step.utils',
  () => {
    const actual = jest.requireActual(
      'src/modules/workflow/workflow-executor/utils/can-execute-step.utils',
    );

    return {
      ...actual,
      canExecuteStep: jest.fn().mockReturnValue(true), // default behavior
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
    updateWorkflowRunStepStatus: jest.fn(),
    saveWorkflowRunState: jest.fn(),
    getWorkflowRun: jest.fn(),
  };

  const mockBillingService = {
    isBillingEnabled: jest.fn().mockReturnValue(true),
    canBillMeteredProduct: jest.fn().mockReturnValue(true),
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
    const mockContext = { trigger: 'trigger-result' };
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

    mockWorkflowRunWorkspaceService.getWorkflowRun.mockReturnValue({
      output: { flow: { steps: mockSteps } },
      context: mockContext,
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
        context: mockContext,
      });

      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        BILLING_FEATURE_USED,
        [
          {
            eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
            value: 1,
          },
        ],
        'workspace-id',
      );

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledTimes(2);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepId: 'step-1',
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.RUNNING,
      });

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledTimes(2);

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: mockStepResult,
        },
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.SUCCESS,
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
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledTimes(1);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepId: 'step-1',
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.RUNNING,
      });

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledTimes(1);

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: {
            error: 'Step execution failed',
          },
        },
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.FAILED,
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
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledTimes(1);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepId: 'step-1',
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.RUNNING,
      });

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledTimes(1);

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: mockPendingEvent,
        },
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.PENDING,
      });

      // No recursive call to execute should happen
      expect(workflowActionFactory.get).not.toHaveBeenCalledWith(
        WorkflowActionType.SEND_EMAIL,
      );
    });

    it('should continue to next step if continueOnFailure is true', async () => {
      const stepsWithContinueOnFailure = [
        {
          id: 'step-1',
          type: WorkflowActionType.CODE,
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: true },
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
        },
      ] as WorkflowAction[];

      mockWorkflowRunWorkspaceService.getWorkflowRun.mockReturnValueOnce({
        output: { flow: { steps: stepsWithContinueOnFailure } },
        context: mockContext,
      });

      mockWorkflowExecutor.execute.mockResolvedValueOnce({
        error: 'Step execution failed but continue',
      });

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledTimes(2);

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepStatus,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepId: 'step-1',
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.RUNNING,
      });

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledTimes(2);

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: {
            error: 'Step execution failed but continue',
          },
        },
        workspaceId: 'workspace-id',
        stepStatus: StepStatus.FAILED,
      });

      // execute second step
      expect(workflowActionFactory.get).toHaveBeenCalledWith(
        WorkflowActionType.SEND_EMAIL,
      );
    });

    it('should retry on failure if retryOnFailure is true', async () => {
      const stepsWithRetryOnFailure = [
        {
          id: 'step-1',
          type: WorkflowActionType.CODE,
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: true },
            },
          },
        },
      ] as WorkflowAction[];

      mockWorkflowRunWorkspaceService.getWorkflowRun.mockReturnValue({
        output: { flow: { steps: stepsWithRetryOnFailure } },
        context: mockContext,
      });

      mockWorkflowExecutor.execute.mockResolvedValue({
        error: 'Step execution failed, will retry',
      });

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      for (let attempt = 1; attempt <= 3; attempt++) {
        expect(workflowActionFactory.get).toHaveBeenNthCalledWith(
          attempt,
          WorkflowActionType.CODE,
        );
      }

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
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledTimes(1);

      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledTimes(
        1,
      );

      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
        stepOutput: {
          id: 'step-1',
          output: {
            error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
          },
        },
        stepStatus: StepStatus.FAILED,
      });

      expect(workflowRunWorkspaceService.endWorkflowRun).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        workspaceId: 'workspace-id',
        status: WorkflowRunStatus.FAILED,
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      });
    });

    it('should return if step should not be executed', async () => {
      (canExecuteStep as jest.Mock).mockReturnValueOnce(false);

      await service.executeFromSteps({
        workflowRunId: mockWorkflowRunId,
        stepIds: ['step-1'],
        workspaceId: mockWorkspaceId,
      });

      expect(workflowActionFactory.get).not.toHaveBeenCalled();
    });
  });

  describe('sendWorkflowNodeRunEvent', () => {
    it('should emit a billing event', () => {
      service['sendWorkflowNodeRunEvent']('workspace-id');

      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        BILLING_FEATURE_USED,
        [
          {
            eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
            value: 1,
          },
        ],
        'workspace-id',
      );
    });
  });
});

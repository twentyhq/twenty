import { Test, TestingModule } from '@nestjs/testing';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE } from 'src/engine/core-modules/billing/constants/billing-workflow-execution-error-message.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkflowExecutorFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-executor.factory';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

describe('WorkflowExecutorWorkspaceService', () => {
  let service: WorkflowExecutorWorkspaceService;
  let workflowExecutorFactory: WorkflowExecutorFactory;
  let workspaceEventEmitter: WorkspaceEventEmitter;
  let workflowRunWorkspaceService: WorkflowRunWorkspaceService;

  const mockWorkflowExecutor = {
    execute: jest.fn().mockResolvedValue({ result: { success: true } }),
  };

  const mockWorkspaceEventEmitter = {
    emitCustomBatchEvent: jest.fn(),
  };

  const mockScopedWorkspaceContext = {
    workspaceId: 'workspace-id',
  };

  const mockScopedWorkspaceContextFactory = {
    create: jest.fn().mockReturnValue(mockScopedWorkspaceContext),
  };

  const mockWorkflowRunWorkspaceService = {
    saveWorkflowRunState: jest.fn(),
  };

  const mockBillingService = {
    isBillingEnabled: jest.fn(),
    canBillMeteredProduct: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowExecutorWorkspaceService,
        {
          provide: WorkflowExecutorFactory,
          useValue: {
            get: jest.fn().mockReturnValue(mockWorkflowExecutor),
          },
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: mockWorkspaceEventEmitter,
        },
        {
          provide: ScopedWorkspaceContextFactory,
          useValue: mockScopedWorkspaceContextFactory,
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
    workflowExecutorFactory = module.get<WorkflowExecutorFactory>(
      WorkflowExecutorFactory,
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
    const mockContext = { data: 'some-data' };
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

    it('should return success when all steps are completed', async () => {
      // No steps to execute
      const result = await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-2',
        steps: mockSteps,
        context: mockContext,
      });

      expect(result).toEqual({
        result: {
          success: true,
        },
      });
    });

    it('should execute a step and continue to the next step on success', async () => {
      const mockStepResult = {
        result: { stepOutput: 'success' },
      };

      mockWorkflowExecutor.execute.mockResolvedValueOnce(mockStepResult);

      const result = await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: mockSteps,
        context: mockContext,
      });

      // execute first step
      expect(workflowExecutorFactory.get).toHaveBeenCalledWith(
        WorkflowActionType.CODE,
      );
      expect(mockWorkflowExecutor.execute).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: mockSteps,
        context: mockContext,
        attemptCount: 1,
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
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: mockStepResult,
        },
        context: {
          data: 'some-data',
          'step-1': { stepOutput: 'success' },
        },
        workspaceId: 'workspace-id',
      });
      expect(result).toEqual({ result: { success: true } });

      // execute second step
      expect(workflowExecutorFactory.get).toHaveBeenCalledWith(
        WorkflowActionType.SEND_EMAIL,
      );
    });

    it('should handle step execution errors', async () => {
      mockWorkflowExecutor.execute.mockRejectedValueOnce(
        new Error('Step execution failed'),
      );

      const result = await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: mockSteps,
        context: mockContext,
      });

      expect(result).toEqual({
        error: 'Step execution failed',
      });
      expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();
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
        context: mockContext,
        workspaceId: 'workspace-id',
      });
    });

    it('should handle pending events', async () => {
      const mockPendingEvent = {
        pendingEvent: true,
      };

      mockWorkflowExecutor.execute.mockResolvedValueOnce(mockPendingEvent);

      const result = await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: mockSteps,
        context: mockContext,
      });

      expect(result).toEqual(mockPendingEvent);
      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: mockPendingEvent,
        },
        context: mockContext,
        workspaceId: 'workspace-id',
      });

      // No recursive call to execute should happen
      expect(workflowExecutorFactory.get).not.toHaveBeenCalledWith(
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

      mockWorkflowExecutor.execute.mockResolvedValueOnce({
        error: 'Step execution failed but continue',
      });

      const result = await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: stepsWithContinueOnFailure,
        context: mockContext,
      });

      // execute first step
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
        context: mockContext,
        workspaceId: 'workspace-id',
      });
      expect(result).toEqual({ result: { success: true } });

      // execute second step
      expect(workflowExecutorFactory.get).toHaveBeenCalledWith(
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

      mockWorkflowExecutor.execute.mockResolvedValueOnce({
        error: 'Step execution failed, will retry',
      });

      await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: stepsWithRetryOnFailure,
        context: mockContext,
      });

      // Should call execute again with increased attemptCount
      expect(workflowExecutorFactory.get).toHaveBeenCalledWith(
        WorkflowActionType.CODE,
      );
      expect(workflowExecutorFactory.get).not.toHaveBeenCalledWith(
        WorkflowActionType.SEND_EMAIL,
      );
      expect(workflowExecutorFactory.get).toHaveBeenCalledTimes(2);
    });

    it('should stop retrying after MAX_RETRIES_ON_FAILURE', async () => {
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

      const errorOutput = {
        error: 'Step execution failed, max retries reached',
      };

      mockWorkflowExecutor.execute.mockResolvedValueOnce(errorOutput);

      const result = await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: stepsWithRetryOnFailure,
        context: mockContext,
        attemptCount: 3, // MAX_RETRIES_ON_FAILURE is 3
      });

      // Should not retry anymore
      expect(workflowExecutorFactory.get).toHaveBeenCalledTimes(1);
      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: errorOutput,
        },
        context: mockContext,
        workspaceId: 'workspace-id',
      });
      expect(result).toEqual(errorOutput);
    });

    it('should stop when billing validation fails', async () => {
      mockBillingService.isBillingEnabled.mockReturnValueOnce(true);
      mockBillingService.canBillMeteredProduct.mockReturnValueOnce(false);

      const result = await service.execute({
        workflowRunId: mockWorkflowRunId,
        currentStepId: 'step-1',
        steps: mockSteps,
        context: mockContext,
      });

      expect(workflowExecutorFactory.get).toHaveBeenCalledTimes(1);
      expect(
        workflowRunWorkspaceService.saveWorkflowRunState,
      ).toHaveBeenCalledWith({
        workflowRunId: mockWorkflowRunId,
        stepOutput: {
          id: 'step-1',
          output: {
            error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
          },
        },
        context: mockContext,
        workspaceId: 'workspace-id',
      });
      expect(result).toEqual({
        error: BILLING_WORKFLOW_EXECUTION_ERROR_MESSAGE,
      });
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

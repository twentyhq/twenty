import { Test, type TestingModule } from '@nestjs/testing';

import { StepStatus } from 'twenty-shared/workflow';

import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { IteratorWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/iterator.workflow-action';
import { type WorkflowIteratorActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { type WorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

describe('IteratorWorkflowAction', () => {
  let service: IteratorWorkflowAction;
  let workflowRunWorkspaceService: jest.Mocked<WorkflowRunWorkspaceService>;

  const mockWorkflowRunId = 'workflow-run-1';
  const mockWorkspaceId = 'workspace-1';
  const mockIteratorStepId = 'iterator-step-1';
  const mockInitialLoopStepIds = ['step-1', 'step-2'];

  const baseSettings: WorkflowActionSettings = {
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
    input: {
      items: [],
      initialLoopStepIds: mockInitialLoopStepIds,
    },
  };

  const iteratorSettings: WorkflowIteratorActionSettings = {
    ...baseSettings,
    input: {
      items: [],
      initialLoopStepIds: mockInitialLoopStepIds,
    },
  };

  const createEmptyAction = (): WorkflowAction => ({
    id: mockIteratorStepId,
    type: WorkflowActionType.EMPTY,
    name: 'Empty Step',
    valid: true,
    settings: baseSettings,
  });

  const createIteratorAction = (items: any): WorkflowAction => ({
    id: mockIteratorStepId,
    type: WorkflowActionType.ITERATOR,
    name: 'Iterator Step',
    valid: true,
    settings: {
      ...iteratorSettings,
      input: {
        items,
        initialLoopStepIds: mockInitialLoopStepIds,
      },
    },
  });

  beforeEach(async () => {
    workflowRunWorkspaceService = {
      getWorkflowRunOrFail: jest.fn(),
      updateWorkflowRunStepInfos: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IteratorWorkflowAction,
        {
          provide: WorkflowRunWorkspaceService,
          useValue: workflowRunWorkspaceService,
        },
      ],
    }).compile();

    service = module.get<IteratorWorkflowAction>(IteratorWorkflowAction);
  });

  describe('execute', () => {
    it('should throw error if step is not an iterator action', async () => {
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createEmptyAction()],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      await expect(service.execute(input)).rejects.toThrow(
        WorkflowStepExecutorException,
      );
    });

    it('should throw error if items is not an array', async () => {
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createIteratorAction('not-an-array')],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      await expect(service.execute(input)).rejects.toThrow();
    });

    it('should return early if no items to process', async () => {
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createIteratorAction([])],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      const result = await service.execute(input);

      expect(result).toEqual({
        result: {
          currentItemIndex: 0,
          currentItem: undefined,
          hasProcessedAllItems: true,
        },
      });
    });

    it('should process first item correctly', async () => {
      const items = ['item1', 'item2'];
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createIteratorAction(items)],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      workflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValue({
        state: {
          stepInfos: {},
        },
      } as any);

      const result = await service.execute(input);

      expect(result).toEqual({
        result: {
          currentItemIndex: 0,
          currentItem: 'item1',
          hasProcessedAllItems: false,
        },
        shouldRemainRunning: true,
      });
    });

    it('should process next item and reset loop steps', async () => {
      const items = ['item1', 'item2'];
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createIteratorAction(items)],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      const mockStepInfo = {
        state: {
          stepInfos: {
            [mockIteratorStepId]: {
              result: {
                currentItemIndex: 0,
                currentItem: 'item1',
                hasProcessedAllItems: false,
              },
              status: StepStatus.SUCCESS,
            },
          },
        },
      } as any;

      workflowRunWorkspaceService.getWorkflowRunOrFail
        .mockResolvedValueOnce(mockStepInfo)
        .mockResolvedValueOnce(mockStepInfo);

      const result = await service.execute(input);

      expect(result).toEqual({
        result: {
          currentItemIndex: 1,
          currentItem: 'item2',
          hasProcessedAllItems: false,
        },
        shouldRemainRunning: true,
      });

      expect(
        workflowRunWorkspaceService.updateWorkflowRunStepInfos,
      ).toHaveBeenCalledWith({
        stepInfos: expect.any(Object),
        workflowRunId: mockWorkflowRunId,
        workspaceId: mockWorkspaceId,
      });
    });

    it('should complete iteration when all items are processed', async () => {
      const items = ['item1'];
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createIteratorAction(items)],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      const mockStepInfo = {
        state: {
          stepInfos: {
            [mockIteratorStepId]: {
              result: {
                currentItemIndex: 0,
                currentItem: 'item1',
                hasProcessedAllItems: false,
              },
              status: StepStatus.SUCCESS,
            },
          },
        },
      } as any;

      workflowRunWorkspaceService.getWorkflowRunOrFail
        .mockResolvedValueOnce(mockStepInfo)
        .mockResolvedValueOnce(mockStepInfo);

      const result = await service.execute(input);

      expect(result).toEqual({
        result: {
          currentItemIndex: 1,
          currentItem: undefined,
          hasProcessedAllItems: true,
        },
        shouldRemainRunning: false,
      });
    });

    it('should throw error when max iterations is reached', async () => {
      const items = Array(10001).fill('item');
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createIteratorAction(items)],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      workflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValue({
        state: {
          stepInfos: {
            [mockIteratorStepId]: {
              result: {
                currentItemIndex: 10000,
                currentItem: 'item',
                hasProcessedAllItems: false,
              },
              status: StepStatus.SUCCESS,
            },
          },
        },
      } as any);

      await expect(service.execute(input)).rejects.toThrow(
        WorkflowStepExecutorException,
      );
    });

    it('should handle JSON string input for items', async () => {
      const items = JSON.stringify(['item1', 'item2']);
      const input = {
        currentStepId: mockIteratorStepId,
        steps: [createIteratorAction(items)],
        context: {},
        runInfo: {
          workflowRunId: mockWorkflowRunId,
          workspaceId: mockWorkspaceId,
        },
      };

      workflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValue({
        state: {
          stepInfos: {},
        },
      } as any);

      const result = await service.execute(input);

      expect(result).toEqual({
        result: {
          currentItemIndex: 0,
          currentItem: 'item1',
          hasProcessedAllItems: false,
        },
        shouldRemainRunning: true,
      });
    });
  });
});

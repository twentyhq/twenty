import { StepStatus } from 'twenty-shared/workflow';

import { shouldExecuteIteratorStep } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/should-execute-iterator-step.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Mock the getAllStepIdsInLoop utility
jest.mock(
  'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util',
  () => ({
    getAllStepIdsInLoop: jest.fn(),
  }),
);

const { getAllStepIdsInLoop } = jest.requireMock(
  'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util',
);

describe('shouldExecuteIteratorStep', () => {
  const createMockIteratorStep = (
    id: string,
    initialLoopStepIds: string[] = [],
  ): WorkflowIteratorAction => ({
    id,
    name: 'Iterator Step',
    type: WorkflowActionType.ITERATOR,
    settings: {
      input: {
        initialLoopStepIds,
        items: [],
      },
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
      outputSchema: {},
    },
    valid: true,
    nextStepIds: [],
  });

  const createMockStep = (
    id: string,
    nextStepIds: string[] = [],
  ): WorkflowAction => ({
    id,
    name: 'Mock Step',
    type: WorkflowActionType.CODE,
    settings: {
      input: {
        serverlessFunctionId: 'mock-function-id',
        serverlessFunctionVersion: 'mock-function-version',
        serverlessFunctionInput: {},
      },
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
      outputSchema: {},
    },
    valid: true,
    nextStepIds,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the step has not been started', () => {
    it('should return true when all parent steps are successful', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', [
        'step-1',
        'step-2',
      ]);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        createMockStep('step-3', ['step-4']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.SUCCESS },
        'step-3': { status: StepStatus.SUCCESS },
      };

      // Mock getAllStepIdsInLoop to return the loop step IDs
      getAllStepIdsInLoop.mockReturnValue(['step-1', 'step-2']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
      expect(getAllStepIdsInLoop).toHaveBeenCalledWith({
        iteratorStepId: 'iterator-1',
        initialLoopStepIds: ['step-1', 'step-2'],
        steps,
      });
    });

    it('should return false when some parent steps not in loop have failed', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', [
        'step-1',
        'step-2',
      ]);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.FAILED },
        'step-2': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-2']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false when some parent steps are not started', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', [
        'step-1',
        'step-2',
      ]);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.NOT_STARTED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return true even if loop step is not started', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop
        createMockStep('step-2', ['iterator-1']), // Not in loop
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.NOT_STARTED }, // This shouldn't affect the result
        'step-2': { status: StepStatus.SUCCESS },
      };

      // Only step-1 is in the loop
      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return true when there are no parent steps targeting the iterator', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', []);
      const steps = [
        createMockStep('step-1', ['step-2']),
        createMockStep('step-2', []),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue([]);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should handle undefined steps gracefully', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        undefined as unknown as WorkflowAction,
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should work correctly with multiple steps targeting the same iterator', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', [
        'step-1',
        'step-2',
        'step-3',
      ]);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        createMockStep('step-3', ['iterator-1']),
        createMockStep('step-4', ['step-5']), // Not targeting iterator
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.SUCCESS },
        'step-3': { status: StepStatus.SUCCESS },
        'step-4': { status: StepStatus.FAILED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1', 'step-2', 'step-3']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });
  });

  describe('when the step has been started', () => {
    it('should return true if all the steps targeting the iterator have been successful', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'iterator-1': { status: StepStatus.RUNNING }, // Iterator has been started
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return false if some of the steps targeting the iterator have failed', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'iterator-1': { status: StepStatus.RUNNING }, // Iterator has been started
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.FAILED }, // This step failed
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false if some of the steps targeting the iterator are still running', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'iterator-1': { status: StepStatus.RUNNING }, // Iterator has been started
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.RUNNING }, // This step is still running
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return true when there are no steps targeting the iterator', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', []);
      const steps = [createMockStep('step-1', ['step-2']), iteratorStep];
      const stepInfos = {
        'iterator-1': { status: StepStatus.RUNNING }, // Iterator has been started
        'step-1': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue([]);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should check all steps targeting iterator including loop steps when iterator has been started', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop and targeting iterator
        createMockStep('step-2', ['iterator-1']), // Not in loop but targeting iterator
        iteratorStep,
      ];
      const stepInfos = {
        'iterator-1': { status: StepStatus.SUCCESS }, // Iterator has been started
        'step-1': { status: StepStatus.SUCCESS }, // Loop step successful
        'step-2': { status: StepStatus.SUCCESS }, // Non-loop step successful
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return false when loop step has NOT_STARTED status and iterator has been started', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop
        createMockStep('step-2', ['iterator-1']), // Not in loop
        iteratorStep,
      ];
      const stepInfos = {
        'iterator-1': { status: StepStatus.RUNNING }, // Iterator has been started
        'step-1': { status: StepStatus.NOT_STARTED }, // Loop step not started
        'step-2': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty step info for parent steps', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        // step-2 doesn't have info
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      // Should return false because step-2 info is undefined
      expect(result).toBe(false);
    });

    it('should work with complex loop structures', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', [
        'step-1',
        'step-2',
        'step-3',
      ]);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop
        createMockStep('step-2', ['iterator-1']), // In loop
        createMockStep('step-3', ['iterator-1']), // In loop
        createMockStep('step-4', ['iterator-1']), // Not in loop
        createMockStep('step-5', ['iterator-1']), // Not in loop
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS }, // Loop steps can be any status
        'step-2': { status: StepStatus.FAILED },
        'step-3': { status: StepStatus.NOT_STARTED },
        'step-4': { status: StepStatus.SUCCESS }, // Non-loop steps must be successful
        'step-5': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1', 'step-2', 'step-3']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return false with complex loop when one non-loop parent is not successful', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', [
        'step-1',
        'step-2',
      ]);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop
        createMockStep('step-2', ['iterator-1']), // In loop
        createMockStep('step-3', ['iterator-1']), // Not in loop
        createMockStep('step-4', ['iterator-1']), // Not in loop
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
        'step-2': { status: StepStatus.SUCCESS },
        'step-3': { status: StepStatus.SUCCESS },
        'step-4': { status: StepStatus.FAILED }, // This should prevent execution
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1', 'step-2']);

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should handle when iterator has no initialLoopStepIds defined', () => {
      const iteratorStep = {
        ...createMockIteratorStep('iterator-1'),
        settings: {
          input: {
            initialLoopStepIds: undefined,
            items: [],
          },
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
      } as WorkflowIteratorAction;

      const steps = [createMockStep('step-1', ['iterator-1']), iteratorStep];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS },
      };

      const result = shouldExecuteIteratorStep({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      // getAllStepIdsInLoop should not be called if initialLoopStepIds is undefined
      expect(getAllStepIdsInLoop).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});

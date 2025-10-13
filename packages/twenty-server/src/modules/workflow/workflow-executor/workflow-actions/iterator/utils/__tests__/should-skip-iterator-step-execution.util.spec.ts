import { StepStatus } from 'twenty-shared/workflow';

import { shouldSkipIteratorStepExecution } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/should-skip-iterator-step-execution.util';
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

describe('shouldSkipIteratorStepExecution', () => {
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

  describe('when the iterator has not been started', () => {
    it('should return true when all parent steps are skipped', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return true when all parent steps are stopped', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.STOPPED },
        'step-2': { status: StepStatus.STOPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return true when parent steps are mix of skipped and stopped', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.STOPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return false when at least one parent step is successful', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SUCCESS },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false when at least one parent step is failed', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.FAILED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false when at least one parent step is not started', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.NOT_STARTED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should only check parent steps not in loop', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop
        createMockStep('step-2', ['iterator-1']), // Not in loop
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS }, // This should be ignored
        'step-2': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return false when there are no parent steps', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', []);
      const steps = [
        createMockStep('step-1', ['step-2']),
        createMockStep('step-2', []),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue([]);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should handle undefined steps gracefully', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        undefined as unknown as WorkflowAction,
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
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
      ]);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop
        createMockStep('step-2', ['iterator-1']), // In loop
        createMockStep('step-3', ['iterator-1']), // Not in loop
        createMockStep('step-4', ['iterator-1']), // Not in loop
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS }, // Loop step, should be ignored
        'step-2': { status: StepStatus.SUCCESS }, // Loop step, should be ignored
        'step-3': { status: StepStatus.SKIPPED },
        'step-4': { status: StepStatus.STOPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1', 'step-2']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });

    it('should return false when one non-loop parent is not skipped/stopped', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']), // In loop
        createMockStep('step-2', ['iterator-1']), // Not in loop
        createMockStep('step-3', ['iterator-1']), // Not in loop
        iteratorStep,
      ];
      const stepInfos = {
        'step-1': { status: StepStatus.SUCCESS }, // Loop step, ignored
        'step-2': { status: StepStatus.SKIPPED },
        'step-3': { status: StepStatus.RUNNING }, // This should make it return false
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });
  });

  describe('when the iterator has been started', () => {
    it('should return false when iterator has been started', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'iterator-1': { status: StepStatus.RUNNING }, // Iterator has been started
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false even when all parent steps are skipped/stopped', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [
        createMockStep('step-1', ['iterator-1']),
        createMockStep('step-2', ['iterator-1']),
        iteratorStep,
      ];
      const stepInfos = {
        'iterator-1': { status: StepStatus.SUCCESS }, // Iterator has been started
        'step-1': { status: StepStatus.SKIPPED },
        'step-2': { status: StepStatus.STOPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false when iterator is pending', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [createMockStep('step-1', ['iterator-1']), iteratorStep];
      const stepInfos = {
        'iterator-1': { status: StepStatus.PENDING },
        'step-1': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false when iterator is skipped', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [createMockStep('step-1', ['iterator-1']), iteratorStep];
      const stepInfos = {
        'iterator-1': { status: StepStatus.SKIPPED },
        'step-1': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });

    it('should return false when iterator failed', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', ['step-1']);
      const steps = [createMockStep('step-1', ['iterator-1']), iteratorStep];
      const stepInfos = {
        'iterator-1': { status: StepStatus.FAILED },
        'step-1': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue(['step-1']);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(false);
    });
  });

  describe('edge cases with initialLoopStepIds', () => {
    it('should handle undefined initialLoopStepIds', () => {
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
        'step-1': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue([]);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
      expect(getAllStepIdsInLoop).not.toHaveBeenCalled();
    });

    it('should handle empty initialLoopStepIds array', () => {
      const iteratorStep = createMockIteratorStep('iterator-1', []);
      const steps = [createMockStep('step-1', ['iterator-1']), iteratorStep];
      const stepInfos = {
        'step-1': { status: StepStatus.SKIPPED },
      };

      getAllStepIdsInLoop.mockReturnValue([]);

      const result = shouldSkipIteratorStepExecution({
        step: iteratorStep,
        steps,
        stepInfos,
      });

      expect(result).toBe(true);
    });
  });
});

import { StepStatus } from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIfElseStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { shouldFailSafelyIteratorStep } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/should-fail-safely-iterator-step.util';

describe('shouldFailSafelyIteratorStep', () => {
  describe('unstarted iterator', () => {
    it('should return false when external parent is SUCCESS', () => {
      const parent = createMockCodeStep('parent', ['iterator1']);
      const iterator = createMockIteratorStep('iterator1', [], ['stepA'], true);

      const stepA = createMockCodeStep('stepA', ['iterator1']);
      const steps = [parent, iterator, stepA];

      const result = shouldFailSafelyIteratorStep({
        step: iterator,
        steps,
        stepInfos: {
          parent: { status: StepStatus.SUCCESS, result: {} },
        },
      });

      expect(result).toBe(false);
    });

    it('should return true when external parent is FAILED_SAFELY', () => {
      const parent = createMockCodeStep('parent', ['iterator1']);
      const iterator = createMockIteratorStep('iterator1', [], ['stepA'], true);
      const stepA = createMockCodeStep('stepA', ['iterator1']);
      const steps = [parent, iterator, stepA];

      const result = shouldFailSafelyIteratorStep({
        step: iterator,
        steps,
        stepInfos: {
          parent: { status: StepStatus.FAILED_SAFELY },
        },
      });

      expect(result).toBe(true);
    });

    it('should return false when no external parents', () => {
      const iterator = createMockIteratorStep('iterator1', [], ['stepA'], true);
      const stepA = createMockCodeStep('stepA', ['iterator1']);
      const steps = [iterator, stepA];

      const result = shouldFailSafelyIteratorStep({
        step: iterator,
        steps,
        stepInfos: {},
      });

      expect(result).toBe(false);
    });
  });

  describe('started iterator with flag', () => {
    it('should return false when failure originated from own loop', () => {
      const iterator = createMockIteratorStep('iterator1', [], ['stepA'], true);
      const stepA = createMockCodeStep('stepA', ['stepB']);
      const stepB = createMockCodeStep('stepB', ['iterator1']);
      const steps = [iterator, stepA, stepB];

      const result = shouldFailSafelyIteratorStep({
        step: iterator,
        steps,
        stepInfos: {
          iterator1: { status: StepStatus.RUNNING },
          stepA: { status: StepStatus.FAILED_SAFELY, error: 'actual error' },
          stepB: { status: StepStatus.FAILED_SAFELY },
        },
      });

      expect(result).toBe(false);
    });

    it('should return false when loop-back parents have no FAILED_SAFELY', () => {
      const iterator = createMockIteratorStep('iterator1', [], ['stepA'], true);
      const stepA = createMockCodeStep('stepA', ['stepB']);
      const stepB = createMockCodeStep('stepB', ['iterator1']);
      const steps = [iterator, stepA, stepB];

      const result = shouldFailSafelyIteratorStep({
        step: iterator,
        steps,
        stepInfos: {
          iterator1: { status: StepStatus.RUNNING },
          stepA: { status: StepStatus.SUCCESS, result: {} },
          stepB: { status: StepStatus.SUCCESS, result: {} },
        },
      });

      expect(result).toBe(false);
    });
  });

  describe('started iterator without flag', () => {
    it('should return true when loop-back parent is FAILED_SAFELY', () => {
      const iterator = createMockIteratorStep(
        'iterator1',
        [],
        ['stepA'],
        false,
      );
      const stepA = createMockCodeStep('stepA', ['stepB']);
      const stepB = createMockCodeStep('stepB', ['iterator1']);
      const steps = [iterator, stepA, stepB];

      const result = shouldFailSafelyIteratorStep({
        step: iterator,
        steps,
        stepInfos: {
          iterator1: { status: StepStatus.RUNNING },
          stepA: { status: StepStatus.FAILED_SAFELY, error: 'err' },
          stepB: { status: StepStatus.FAILED_SAFELY },
        },
      });

      expect(result).toBe(true);
    });

    it('should return false when loop-back parents are not all terminal', () => {
      const iterator = createMockIteratorStep(
        'iterator1',
        [],
        ['stepA'],
        false,
      );
      const stepA = createMockCodeStep('stepA', ['stepB']);
      const stepB = createMockCodeStep('stepB', ['iterator1']);
      const steps = [iterator, stepA, stepB];

      const result = shouldFailSafelyIteratorStep({
        step: iterator,
        steps,
        stepInfos: {
          iterator1: { status: StepStatus.RUNNING },
          stepA: { status: StepStatus.FAILED_SAFELY, error: 'err' },
          stepB: { status: StepStatus.RUNNING },
        },
      });

      expect(result).toBe(false);
    });
  });
  describe('iterator already failed safely', () => {
    it.each([true, false])(
      'should return false when its loop comes back to it (flag: %s)',
      (shouldContinueOnIterationFailure) => {
        const findStep = createMockCodeStep('find', ['iterator1'], {
          continueOnFailure: true,
        });
        const iterator = createMockIteratorStep(
          'iterator1',
          [],
          ['ifElseA'],
          shouldContinueOnIterationFailure,
        );
        const ifElseA = createMockIfElseStep('ifElseA', [
          { id: 'branchA1', nextStepIds: ['updateA'] },
          { id: 'branchA2', nextStepIds: ['ifElseB'] },
        ]);
        const updateA = createMockCodeStep('updateA', ['iterator1']);
        const ifElseB = createMockIfElseStep('ifElseB', [
          { id: 'branchB1', nextStepIds: ['updateB'] },
          { id: 'branchB2', nextStepIds: ['iterator1'] },
        ]);
        const updateB = createMockCodeStep('updateB', ['iterator1']);
        const steps = [findStep, iterator, ifElseA, updateA, ifElseB, updateB];

        const result = shouldFailSafelyIteratorStep({
          step: iterator,
          steps,
          stepInfos: {
            find: { status: StepStatus.FAILED_SAFELY, error: 'Invalid filter' },
            iterator1: { status: StepStatus.FAILED_SAFELY },
            ifElseA: { status: StepStatus.FAILED_SAFELY },
            updateA: { status: StepStatus.FAILED_SAFELY },
            ifElseB: { status: StepStatus.FAILED_SAFELY },
            updateB: { status: StepStatus.FAILED_SAFELY },
          },
        });

        expect(result).toBe(false);
      },
    );
  });
});

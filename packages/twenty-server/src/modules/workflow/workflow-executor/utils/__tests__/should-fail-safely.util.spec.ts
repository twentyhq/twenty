import { StepStatus } from 'twenty-shared/workflow';

import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { shouldFailSafely } from 'src/modules/workflow/workflow-executor/utils/should-fail-safely.util';

describe('shouldFailSafely', () => {
  it('should return false when step has no parents', () => {
    const step = createMockCodeStep('step1');
    const steps = [step];

    const result = shouldFailSafely({
      step,
      steps,
      stepInfos: {},
    });

    expect(result).toBe(false);
  });

  it('should return false when all parents are SUCCESS', () => {
    const parentStep = createMockCodeStep('parent', ['child']);
    const childStep = createMockCodeStep('child');
    const steps = [parentStep, childStep];

    const result = shouldFailSafely({
      step: childStep,
      steps,
      stepInfos: {
        parent: { status: StepStatus.SUCCESS, result: {} },
      },
    });

    expect(result).toBe(false);
  });

  it('should return true when one parent is FAILED_SAFELY and all are terminal', () => {
    const parent1 = createMockCodeStep('parent1', ['child']);
    const parent2 = createMockCodeStep('parent2', ['child']);
    const childStep = createMockCodeStep('child');
    const steps = [parent1, parent2, childStep];

    const result = shouldFailSafely({
      step: childStep,
      steps,
      stepInfos: {
        parent1: { status: StepStatus.FAILED_SAFELY, error: 'some error' },
        parent2: { status: StepStatus.SUCCESS, result: {} },
      },
    });

    expect(result).toBe(true);
  });

  it('should return false when parent is FAILED_SAFELY but another parent is still running', () => {
    const parent1 = createMockCodeStep('parent1', ['child']);
    const parent2 = createMockCodeStep('parent2', ['child']);
    const childStep = createMockCodeStep('child');
    const steps = [parent1, parent2, childStep];

    const result = shouldFailSafely({
      step: childStep,
      steps,
      stepInfos: {
        parent1: { status: StepStatus.FAILED_SAFELY, error: 'some error' },
        parent2: { status: StepStatus.RUNNING },
      },
    });

    expect(result).toBe(false);
  });

  it('should return true when all parents are FAILED_SAFELY', () => {
    const parent1 = createMockCodeStep('parent1', ['child']);
    const parent2 = createMockCodeStep('parent2', ['child']);
    const childStep = createMockCodeStep('child');
    const steps = [parent1, parent2, childStep];

    const result = shouldFailSafely({
      step: childStep,
      steps,
      stepInfos: {
        parent1: { status: StepStatus.FAILED_SAFELY },
        parent2: { status: StepStatus.FAILED_SAFELY, error: 'err' },
      },
    });

    expect(result).toBe(true);
  });

  it('should return true for FAILED_SAFELY + SKIPPED parents', () => {
    const parent1 = createMockCodeStep('parent1', ['child']);
    const parent2 = createMockCodeStep('parent2', ['child']);
    const childStep = createMockCodeStep('child');
    const steps = [parent1, parent2, childStep];

    const result = shouldFailSafely({
      step: childStep,
      steps,
      stepInfos: {
        parent1: { status: StepStatus.FAILED_SAFELY },
        parent2: { status: StepStatus.SKIPPED },
      },
    });

    expect(result).toBe(true);
  });
});

describe('shouldFailSafely for iterator steps', () => {
  it('should return false for iterator with flag when failure from own loop', () => {
    const iterator = createMockIteratorStep(
      'iterator1',
      ['after'],
      ['stepA'],
      true,
    );
    const stepA = createMockCodeStep('stepA', ['stepB']);
    const stepB = createMockCodeStep('stepB', ['iterator1']);
    const steps = [iterator, stepA, stepB];

    const result = shouldFailSafely({
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

  it('should return true for iterator without flag when loop-back parent is FAILED_SAFELY', () => {
    const iterator = createMockIteratorStep(
      'iterator1',
      ['after'],
      ['stepA'],
      false,
    );
    const stepA = createMockCodeStep('stepA', ['stepB']);
    const stepB = createMockCodeStep('stepB', ['iterator1']);
    const steps = [iterator, stepA, stepB];

    const result = shouldFailSafely({
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

  it('should return true for unstarted iterator when external parent is FAILED_SAFELY', () => {
    const parentStep = createMockCodeStep('parent', ['iterator1']);
    const iterator = createMockIteratorStep(
      'iterator1',
      ['after'],
      ['stepA'],
      true,
    );
    const stepA = createMockCodeStep('stepA', ['iterator1']);
    const steps = [parentStep, iterator, stepA];

    const result = shouldFailSafely({
      step: iterator,
      steps,
      stepInfos: {
        parent: { status: StepStatus.FAILED_SAFELY },
      },
    });

    expect(result).toBe(true);
  });
});

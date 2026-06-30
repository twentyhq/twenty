import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { findEnclosingIteratorWithContinueOnFailure } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/find-enclosing-iterator-with-continue-on-failure.util';

describe('findEnclosingIteratorWithContinueOnFailure', () => {
  it('should return undefined when step is not inside any iterator', () => {
    const steps = [
      createMockCodeStep('step1', ['step2']),
      createMockCodeStep('step2', []),
    ];

    const result = findEnclosingIteratorWithContinueOnFailure({
      failedStepId: 'step1',
      steps,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when enclosing iterator does not have the flag', () => {
    const steps = [
      createMockIteratorStep('iterator1', ['after'], ['stepA'], false),
      createMockCodeStep('stepA', ['stepB']),
      createMockCodeStep('stepB', ['iterator1']),
      createMockCodeStep('after', []),
    ];

    const result = findEnclosingIteratorWithContinueOnFailure({
      failedStepId: 'stepA',
      steps,
    });

    expect(result).toBeUndefined();
  });

  it('should return the enclosing iterator when it has the flag', () => {
    const steps = [
      createMockIteratorStep('iterator1', ['after'], ['stepA'], true),
      createMockCodeStep('stepA', ['stepB']),
      createMockCodeStep('stepB', ['iterator1']),
      createMockCodeStep('after', []),
    ];

    const result = findEnclosingIteratorWithContinueOnFailure({
      failedStepId: 'stepA',
      steps,
    });

    expect(result?.id).toBe('iterator1');
  });

  it('should return the innermost iterator with the flag in nested iterators', () => {
    const steps = [
      createMockIteratorStep(
        'outerIterator',
        ['after'],
        ['innerIterator'],
        true,
      ),
      createMockIteratorStep(
        'innerIterator',
        ['outerIterator'],
        ['stepA'],
        true,
      ),
      createMockCodeStep('stepA', ['stepB']),
      createMockCodeStep('stepB', ['innerIterator']),
      createMockCodeStep('after', []),
    ];

    const result = findEnclosingIteratorWithContinueOnFailure({
      failedStepId: 'stepA',
      steps,
    });

    expect(result?.id).toBe('innerIterator');
  });

  it('should skip inner iterator without flag and return outer with flag', () => {
    const steps = [
      createMockIteratorStep(
        'outerIterator',
        ['after'],
        ['innerIterator'],
        true,
      ),
      createMockIteratorStep(
        'innerIterator',
        ['outerIterator'],
        ['stepA'],
        false,
      ),
      createMockCodeStep('stepA', ['stepB']),
      createMockCodeStep('stepB', ['innerIterator']),
      createMockCodeStep('after', []),
    ];

    const result = findEnclosingIteratorWithContinueOnFailure({
      failedStepId: 'stepA',
      steps,
    });

    expect(result?.id).toBe('outerIterator');
  });
});

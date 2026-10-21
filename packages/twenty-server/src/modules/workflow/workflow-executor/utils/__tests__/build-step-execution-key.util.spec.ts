import {
  createMockCodeStep,
  createMockIteratorStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { buildStepExecutionKey } from 'src/modules/workflow/workflow-executor/utils/build-step-execution-key.util';

const STEPS = [
  createMockIteratorStep('outer', [], ['inner']),
  createMockIteratorStep('inner', ['outer'], ['send']),
  createMockCodeStep('send', ['inner']),
  createMockCodeStep('after'),
];

const contextAt = (outerIndex: number, innerIndex: number) => ({
  outer: { currentItemIndex: outerIndex, hasProcessedAllItems: false },
  inner: { currentItemIndex: innerIndex, hasProcessedAllItems: false },
});

describe('buildStepExecutionKey', () => {
  it('keeps the key of a step outside any iterator', () => {
    expect(
      buildStepExecutionKey({
        stepId: 'after',
        steps: STEPS,
        context: contextAt(3, 2),
      }),
    ).toBe('after');
  });

  it('keeps the key when the same iteration runs the step again', () => {
    expect(
      buildStepExecutionKey({
        stepId: 'send',
        steps: STEPS,
        context: contextAt(1, 2),
      }),
    ).toBe(
      buildStepExecutionKey({
        stepId: 'send',
        steps: STEPS,
        context: contextAt(1, 2),
      }),
    );
  });

  it.each([
    [contextAt(1, 3), 'the inner iteration'],
    [contextAt(2, 2), 'the outer iteration'],
  ])('changes the key with %s', (context) => {
    expect(
      buildStepExecutionKey({ stepId: 'send', steps: STEPS, context }),
    ).not.toBe(
      buildStepExecutionKey({
        stepId: 'send',
        steps: STEPS,
        context: contextAt(1, 2),
      }),
    );
  });

  it('names every enclosing iteration', () => {
    expect(
      buildStepExecutionKey({
        stepId: 'send',
        steps: STEPS,
        context: contextAt(1, 2),
      }),
    ).toBe('send:inner=2:outer=1');
  });
});

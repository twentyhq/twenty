import { getNextStepIdsForIterator } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-next-step-ids-for-iterator.util';
import { type WorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const iteratorStep = {
  id: 'iterator',
  type: 'ITERATOR',
  name: 'Iterator',
  nextStepIds: ['afterLoop'],
  settings: { input: { initialLoopStepIds: ['loopBody'] } },
} as unknown as WorkflowIteratorAction;

describe('getNextStepIdsForIterator', () => {
  it('should run the loop body while items remain', () => {
    expect(
      getNextStepIdsForIterator({
        executedStep: iteratorStep,
        executedStepOutput: { result: { hasProcessedAllItems: false } },
      }),
    ).toEqual({ nextStepIdsToExecute: ['loopBody'] });
  });

  it('should fall through to the after-loop steps once every item is processed', () => {
    expect(
      getNextStepIdsForIterator({
        executedStep: iteratorStep,
        executedStepOutput: { result: { hasProcessedAllItems: true } },
      }),
    ).toBeUndefined();
  });

  // A terminated iterator has to hand its after-loop steps back too, otherwise a step
  // converging on them is never evaluated again once its other parent has finished.
  it('should skip the loop body and still evaluate the after-loop steps when skipped', () => {
    expect(
      getNextStepIdsForIterator({
        executedStep: iteratorStep,
        executedStepOutput: { shouldSkipStepExecution: true },
      }),
    ).toEqual({
      nextStepIdsToSkip: ['loopBody'],
      nextStepIdsToExecute: ['afterLoop'],
    });
  });

  it('should fail the loop body safely and still evaluate the after-loop steps', () => {
    expect(
      getNextStepIdsForIterator({
        executedStep: iteratorStep,
        executedStepOutput: { shouldFailSafely: true },
      }),
    ).toEqual({
      nextStepIdsToFailSafely: ['loopBody'],
      nextStepIdsToExecute: ['afterLoop'],
    });
  });
});

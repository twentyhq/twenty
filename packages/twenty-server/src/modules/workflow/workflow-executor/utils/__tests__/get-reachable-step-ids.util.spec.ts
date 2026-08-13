import { getReachableStepIds } from 'src/modules/workflow/workflow-executor/utils/get-reachable-step-ids.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildStep = (id: string, nextStepIds: string[]) =>
  ({
    id,
    type: 'RECORD_UPDATE',
    name: id,
    nextStepIds,
    settings: { input: {} },
  }) as unknown as WorkflowAction;

describe('getReachableStepIds', () => {
  it('should follow nextStepIds transitively', () => {
    const steps = [
      buildStep('a', ['b']),
      buildStep('b', ['c']),
      buildStep('c', []),
      buildStep('unrelated', []),
    ];

    expect(getReachableStepIds({ fromStepIds: ['a'], steps })).toEqual(
      new Set(['a', 'b', 'c']),
    );
  });

  it('should follow if/else branch edges', () => {
    const nestedIfElseStep = {
      id: 'nestedIfElse',
      type: 'IF_ELSE',
      name: 'If/Else',
      nextStepIds: [],
      settings: {
        input: {
          branches: [
            { id: 'ifBranch', nextStepIds: ['insideIf'] },
            { id: 'elseBranch', nextStepIds: ['insideElse'] },
          ],
          stepFilterGroups: [],
          stepFilters: [],
        },
      },
    } as unknown as WorkflowAction;

    const steps = [
      buildStep('a', ['nestedIfElse']),
      nestedIfElseStep,
      buildStep('insideIf', []),
      buildStep('insideElse', []),
    ];

    expect(getReachableStepIds({ fromStepIds: ['a'], steps })).toEqual(
      new Set(['a', 'nestedIfElse', 'insideIf', 'insideElse']),
    );
  });

  it('should follow iterator loop edges', () => {
    const iteratorStep = {
      id: 'iterator',
      type: 'ITERATOR',
      name: 'Iterator',
      nextStepIds: ['afterLoop'],
      settings: { input: { initialLoopStepIds: ['insideLoop'] } },
    } as unknown as WorkflowAction;

    const steps = [
      iteratorStep,
      buildStep('insideLoop', ['iterator']),
      buildStep('afterLoop', []),
    ];

    expect(getReachableStepIds({ fromStepIds: ['iterator'], steps })).toEqual(
      new Set(['iterator', 'insideLoop', 'afterLoop']),
    );
  });

  it('should follow iterator loop edges stored as a serialized string', () => {
    const iteratorStep = {
      id: 'iterator',
      type: 'ITERATOR',
      name: 'Iterator',
      nextStepIds: ['afterLoop'],
      settings: { input: { initialLoopStepIds: '["insideLoop"]' } },
    } as unknown as WorkflowAction;

    const steps = [
      iteratorStep,
      buildStep('insideLoop', ['iterator']),
      buildStep('afterLoop', []),
    ];

    expect(getReachableStepIds({ fromStepIds: ['iterator'], steps })).toEqual(
      new Set(['iterator', 'insideLoop', 'afterLoop']),
    );
  });

  it('should terminate on cycles', () => {
    const steps = [buildStep('a', ['b']), buildStep('b', ['a'])];

    expect(getReachableStepIds({ fromStepIds: ['a'], steps })).toEqual(
      new Set(['a', 'b']),
    );
  });

  it('should keep dangling ids that do not match a step', () => {
    const steps = [buildStep('a', ['missing'])];

    expect(getReachableStepIds({ fromStepIds: ['a'], steps })).toEqual(
      new Set(['a', 'missing']),
    );
  });
});

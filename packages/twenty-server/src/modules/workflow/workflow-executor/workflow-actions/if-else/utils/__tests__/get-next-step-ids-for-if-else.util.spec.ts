import { getNextStepIdsForIfElse } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/utils/get-next-step-ids-for-if-else.util';
import {
  type WorkflowAction,
  type WorkflowIfElseAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildIfElseStep = ({
  ifBranchNextStepIds,
  elseBranchNextStepIds,
}: {
  ifBranchNextStepIds: string[];
  elseBranchNextStepIds: string[];
}) =>
  ({
    id: 'ifElse',
    type: 'IF_ELSE',
    name: 'If/Else',
    nextStepIds: [],
    settings: {
      input: {
        branches: [
          {
            id: 'ifBranch',
            filterGroupId: 'filterGroup',
            nextStepIds: ifBranchNextStepIds,
          },
          { id: 'elseBranch', nextStepIds: elseBranchNextStepIds },
        ],
        stepFilterGroups: [],
        stepFilters: [],
      },
    },
  }) as unknown as WorkflowIfElseAction;

const buildStep = (id: string, nextStepIds: string[]) =>
  ({
    id,
    type: 'RECORD_UPDATE',
    name: id,
    nextStepIds,
    settings: { input: {} },
  }) as unknown as WorkflowAction;

describe('getNextStepIdsForIfElse', () => {
  it('should skip the non matching branch when branches do not converge', () => {
    const ifElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['ifStep'],
      elseBranchNextStepIds: ['elseStep'],
    });

    const steps = [
      ifElseStep,
      buildStep('ifStep', []),
      buildStep('elseStep', []),
    ];

    expect(
      getNextStepIdsForIfElse({
        executedStep: ifElseStep,
        executedStepOutput: { result: { matchingBranchId: 'ifBranch' } },
        steps,
      }),
    ).toEqual({
      nextStepIdsToExecute: ['ifStep'],
      nextStepIdsToSkip: ['elseStep'],
    });
  });

  it('should not skip a step the matching branch converges into', () => {
    const ifElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['ifStep'],
      elseBranchNextStepIds: ['mergeStep'],
    });

    const steps = [
      ifElseStep,
      buildStep('ifStep', ['mergeStep']),
      buildStep('mergeStep', []),
    ];

    expect(
      getNextStepIdsForIfElse({
        executedStep: ifElseStep,
        executedStepOutput: { result: { matchingBranchId: 'ifBranch' } },
        steps,
      }),
    ).toEqual({
      nextStepIdsToExecute: ['ifStep'],
      nextStepIdsToSkip: [],
    });
  });

  it('should not skip a convergence step reached deeper in the matching branch', () => {
    const ifElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['ifStep'],
      elseBranchNextStepIds: ['mergeStep', 'elseOnlyStep'],
    });

    const steps = [
      ifElseStep,
      buildStep('ifStep', ['intermediateStep']),
      buildStep('intermediateStep', ['mergeStep']),
      buildStep('mergeStep', []),
      buildStep('elseOnlyStep', []),
    ];

    expect(
      getNextStepIdsForIfElse({
        executedStep: ifElseStep,
        executedStepOutput: { result: { matchingBranchId: 'ifBranch' } },
        steps,
      }),
    ).toEqual({
      nextStepIdsToExecute: ['ifStep'],
      nextStepIdsToSkip: ['elseOnlyStep'],
    });
  });

  it('should not skip a convergence step reached through an iterator loop', () => {
    const ifElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['iterator'],
      elseBranchNextStepIds: ['mergeStep'],
    });

    const iteratorStep = {
      id: 'iterator',
      type: 'ITERATOR',
      name: 'iterator',
      nextStepIds: ['mergeStep'],
      settings: { input: { initialLoopStepIds: ['insideLoop'] } },
    } as unknown as WorkflowAction;

    const steps = [
      ifElseStep,
      iteratorStep,
      buildStep('insideLoop', ['iterator']),
      buildStep('mergeStep', []),
    ];

    expect(
      getNextStepIdsForIfElse({
        executedStep: ifElseStep,
        executedStepOutput: { result: { matchingBranchId: 'ifBranch' } },
        steps,
      }),
    ).toEqual({
      nextStepIdsToExecute: ['iterator'],
      nextStepIdsToSkip: [],
    });
  });

  it('should still skip a step only reachable through a nested if/else branch', () => {
    // If/Else A
    //   ├ if   → If/Else B (if → step1, else → step2 → merge)
    //   └ else → merge
    // Whether B leads to merge is only known at runtime, so merge must stay
    // in the skip set: keeping it would let status-based evaluation run it
    // even when B goes down its if branch (no taken path into merge).
    const outerIfElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['nestedIfElse'],
      elseBranchNextStepIds: ['mergeStep'],
    });

    const nestedIfElseStep = {
      id: 'nestedIfElse',
      type: 'IF_ELSE',
      name: 'If/Else',
      nextStepIds: [],
      settings: {
        input: {
          branches: [
            {
              id: 'nestedIfBranch',
              filterGroupId: 'nestedFilterGroup',
              nextStepIds: ['step1'],
            },
            { id: 'nestedElseBranch', nextStepIds: ['step2'] },
          ],
          stepFilterGroups: [],
          stepFilters: [],
        },
      },
    } as unknown as WorkflowAction;

    const steps = [
      outerIfElseStep,
      nestedIfElseStep,
      buildStep('step1', []),
      buildStep('step2', ['mergeStep']),
      buildStep('mergeStep', []),
    ];

    expect(
      getNextStepIdsForIfElse({
        executedStep: outerIfElseStep,
        executedStepOutput: { result: { matchingBranchId: 'ifBranch' } },
        steps,
      }),
    ).toEqual({
      nextStepIdsToExecute: ['nestedIfElse'],
      nextStepIdsToSkip: ['mergeStep'],
    });
  });

  it('should terminate when the matching branch contains a cycle', () => {
    const ifElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['loopA'],
      elseBranchNextStepIds: ['elseStep'],
    });

    const steps = [
      ifElseStep,
      buildStep('loopA', ['loopB']),
      buildStep('loopB', ['loopA']),
      buildStep('elseStep', []),
    ];

    expect(
      getNextStepIdsForIfElse({
        executedStep: ifElseStep,
        executedStepOutput: { result: { matchingBranchId: 'ifBranch' } },
        steps,
      }),
    ).toEqual({
      nextStepIdsToExecute: ['loopA'],
      nextStepIdsToSkip: ['elseStep'],
    });
  });

  it('should skip every branch when the if/else step is skipped', () => {
    const ifElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['ifStep'],
      elseBranchNextStepIds: ['elseStep'],
    });

    expect(
      getNextStepIdsForIfElse({
        executedStep: ifElseStep,
        executedStepOutput: { shouldSkipStepExecution: true },
        steps: [ifElseStep],
      }),
    ).toEqual({ nextStepIdsToSkip: ['ifStep', 'elseStep'] });
  });

  it('should fail safely every branch when the if/else step fails safely', () => {
    const ifElseStep = buildIfElseStep({
      ifBranchNextStepIds: ['ifStep'],
      elseBranchNextStepIds: ['elseStep'],
    });

    expect(
      getNextStepIdsForIfElse({
        executedStep: ifElseStep,
        executedStepOutput: { shouldFailSafely: true },
        steps: [ifElseStep],
      }),
    ).toEqual({ nextStepIdsToFailSafely: ['ifStep', 'elseStep'] });
  });
});

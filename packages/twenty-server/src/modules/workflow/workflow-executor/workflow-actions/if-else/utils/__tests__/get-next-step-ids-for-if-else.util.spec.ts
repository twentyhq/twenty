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

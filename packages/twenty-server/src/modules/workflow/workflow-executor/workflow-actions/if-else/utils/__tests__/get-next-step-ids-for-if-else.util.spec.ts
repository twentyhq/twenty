import { getNextStepIdsForIfElse } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/utils/get-next-step-ids-for-if-else.util';
import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildIfElseStep = (branchNextStepIds: string[][]) =>
  ({
    id: 'ifElse',
    type: 'IF_ELSE',
    name: 'If/Else',
    nextStepIds: [],
    settings: {
      input: {
        branches: branchNextStepIds.map((nextStepIds, index) => ({
          id: `branch-${index}`,
          filterGroupId:
            index === branchNextStepIds.length - 1 ? undefined : 'fg',
          nextStepIds,
        })),
        stepFilterGroups: [],
        stepFilters: [],
      },
    },
  }) as unknown as WorkflowIfElseAction;

describe('getNextStepIdsForIfElse', () => {
  it('should hand back every branch root so each one evaluates itself', () => {
    expect(
      getNextStepIdsForIfElse({
        executedStep: buildIfElseStep([
          ['ifStep'],
          ['elseIfStep'],
          ['elseStep'],
        ]),
      }),
    ).toEqual({ nextStepIdsToExecute: ['ifStep', 'elseIfStep', 'elseStep'] });
  });

  it('should hand back a root shared by several branches only once', () => {
    expect(
      getNextStepIdsForIfElse({
        executedStep: buildIfElseStep([['merge'], ['merge']]),
      }),
    ).toEqual({ nextStepIdsToExecute: ['merge'] });
  });

  it('should ignore a branch with no next step', () => {
    expect(
      getNextStepIdsForIfElse({
        executedStep: buildIfElseStep([['ifStep'], []]),
      }),
    ).toEqual({ nextStepIdsToExecute: ['ifStep'] });
  });
});

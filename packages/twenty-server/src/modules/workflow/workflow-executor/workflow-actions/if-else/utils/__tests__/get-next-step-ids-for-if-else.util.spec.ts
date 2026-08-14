import { getNextStepIdsForIfElse } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/utils/get-next-step-ids-for-if-else.util';
import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const ifElseStep = {
  id: 'ifElse',
  type: 'IF_ELSE',
  name: 'If/Else',
  nextStepIds: [],
  settings: {
    input: {
      branches: [
        { id: 'ifBranch', filterGroupId: 'fg', nextStepIds: ['ifStep'] },
        { id: 'elseBranch', nextStepIds: ['elseStep'] },
      ],
      stepFilterGroups: [],
      stepFilters: [],
    },
  },
} as unknown as WorkflowIfElseAction;

describe('getNextStepIdsForIfElse', () => {
  // The branch cut is applied when each root evaluates its parents
  // (getEffectiveParentStatus), never by forcing statuses from here.
  it.each([
    ['a branch matched', { result: { matchingBranchId: 'ifBranch' } }],
    ['the step was skipped', { shouldSkipStepExecution: true }],
    ['the step failed safely', { shouldFailSafely: true }],
  ])('should evaluate every branch root when %s', (_, executedStepOutput) => {
    expect(
      getNextStepIdsForIfElse({ executedStep: ifElseStep, executedStepOutput }),
    ).toEqual({ nextStepIdsToExecute: ['ifStep', 'elseStep'] });
  });
});

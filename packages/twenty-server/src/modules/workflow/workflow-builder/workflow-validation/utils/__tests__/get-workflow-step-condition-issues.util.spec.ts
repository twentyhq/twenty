import { WorkflowActionType } from 'twenty-shared/workflow';

import { getWorkflowStepConditionIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-step-condition-issues.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const SETTINGS = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};

const buildFilterStep = (condition?: string) =>
  ({
    id: 'filter-step',
    name: 'Filter',
    type: WorkflowActionType.FILTER,
    valid: true,
    settings: {
      ...SETTINGS,
      input: { stepFilterGroups: [], stepFilters: [], condition },
    },
  }) as WorkflowAction;

const buildIfElseStep = (conditions: (string | undefined)[]) =>
  ({
    id: 'if-else-step',
    name: 'If/Else',
    type: WorkflowActionType.IF_ELSE,
    valid: true,
    settings: {
      ...SETTINGS,
      input: {
        stepFilterGroups: [],
        stepFilters: [],
        branches: conditions.map((condition, index) => ({
          id: `branch-${index}`,
          nextStepIds: [],
          condition,
        })),
      },
    },
  }) as WorkflowAction;

describe('getWorkflowStepConditionIssues', () => {
  it('accepts conditions over workflow variables and steps without one', () => {
    expect(
      getWorkflowStepConditionIssues(
        buildFilterStep('{{trigger.amount}} > 1000 and isDefined({{step.id}})'),
      ),
    ).toEqual([]);
    expect(getWorkflowStepConditionIssues(buildFilterStep())).toEqual([]);
    expect(
      getWorkflowStepConditionIssues(
        buildIfElseStep(['{{trigger.amount}} > 1000', undefined]),
      ),
    ).toEqual([]);
  });

  it('blocks a filter condition that does not compile', () => {
    expect(
      getWorkflowStepConditionIssues(buildFilterStep('{{trigger.amount}} >')),
    ).toEqual([
      expect.objectContaining({
        code: 'INVALID_STEP_PARAMS',
        stepId: 'filter-step',
        path: 'settings.input.condition',
        message: expect.stringContaining('Expression is incomplete'),
      }),
    ]);
  });

  it('blocks a branch condition reading a record field, which a step has none of', () => {
    expect(
      getWorkflowStepConditionIssues(
        buildIfElseStep(['{{trigger.amount}} > 1000', 'amount > 1000']),
      ),
    ).toEqual([
      expect.objectContaining({
        code: 'INVALID_STEP_PARAMS',
        path: 'settings.input.branches.1.condition',
        message: expect.stringContaining('Unknown field "amount"'),
      }),
    ]);
  });
});

import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowStepExecutorExceptionCode } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { FilterWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/filter.workflow-action';
import { type WorkflowFilterActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/workflow-filter-action-settings.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const ROOT_GROUP = { id: 'root', logicalOperator: StepLogicalOperator.AND };

const NAME_IS_ACME_FILTER = {
  id: 'filter',
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  value: 'Acme',
  stepOutputKey: '{{trigger.name}}',
  stepFilterGroupId: ROOT_GROUP.id,
};

const execute = (input: WorkflowFilterActionSettings['input']) =>
  new FilterWorkflowAction().execute({
    currentStepId: 'filter-step',
    steps: [
      {
        id: 'filter-step',
        name: 'Filter',
        type: WorkflowActionType.FILTER,
        valid: true,
        settings: {
          input,
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
        },
      } as WorkflowAction,
    ],
    context: { trigger: { name: 'Acme', employees: 50 } },
    runInfo: { workflowRunId: 'run', workspaceId: 'workspace' },
  } as Parameters<FilterWorkflowAction['execute']>[0]);

describe('FilterWorkflowAction', () => {
  it('should evaluate the condition instead of the filters when one is set', async () => {
    const result = await execute({
      stepFilterGroups: [ROOT_GROUP],
      stepFilters: [NAME_IS_ACME_FILTER],
      condition: '{{trigger.employees}} > 100',
    });

    expect(result).toEqual({
      result: { matchesFilter: false },
      shouldEndWorkflowRun: true,
    });
  });

  it('should keep the legacy filters without a condition', async () => {
    const result = await execute({
      stepFilterGroups: [ROOT_GROUP],
      stepFilters: [NAME_IS_ACME_FILTER],
      condition: '',
    });

    expect(result).toEqual({
      result: { matchesFilter: true },
      shouldEndWorkflowRun: false,
    });
  });

  it('should fail the step when the condition cannot be evaluated', async () => {
    await expect(
      execute({
        stepFilterGroups: [],
        stepFilters: [],
        condition: '{{trigger.employees}}',
      }),
    ).rejects.toMatchObject({
      code: WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    });
  });
});

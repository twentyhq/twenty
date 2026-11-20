import { type StepFilterWithPotentiallyDeprecatedOperand } from '@/types';
import { isDefined } from '@/utils';
import { convertViewFilterOperandToCoreOperand } from '@/utils/filter/utils/convert-view-filter-operand-to-core-operand.util';
import { getStepFilterOperands } from '@/workflow/utils/getStepFilterOperands';
import {
  type ValidatableWorkflowStep,
  type WorkflowValidationIssue,
} from '@/workflow/validation/types/WorkflowValidation';

export const getUnsupportedStepFilterOperandIssues = ({
  stepFilters,
  step,
}: {
  stepFilters: Pick<
    StepFilterWithPotentiallyDeprecatedOperand,
    'type' | 'operand' | 'compositeFieldSubFieldName'
  >[];
  step?: Pick<ValidatableWorkflowStep, 'id' | 'name'>;
}): WorkflowValidationIssue[] =>
  stepFilters.flatMap((stepFilter): WorkflowValidationIssue[] => {
    const supportedOperands = getStepFilterOperands({
      filterType: stepFilter.type,
      subFieldName: stepFilter.compositeFieldSubFieldName,
    });

    if (
      supportedOperands.includes(
        convertViewFilterOperandToCoreOperand(stepFilter.operand),
      )
    ) {
      return [];
    }

    const owner = isDefined(step)
      ? `Step "${step.name ?? step.id}"`
      : 'The trigger';

    return [
      {
        severity: 'error',
        code: 'UNSUPPORTED_STEP_FILTER_OPERAND',
        message: `${owner} has a ${stepFilter.type} filter with operand "${stepFilter.operand}", which is not supported for this filter type. Use one of: ${supportedOperands.join(', ')}.`,
        stepId: step?.id,
      },
    ];
  });

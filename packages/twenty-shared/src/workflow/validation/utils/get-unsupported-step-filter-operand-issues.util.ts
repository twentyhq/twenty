import { type StepFilterWithPotentiallyDeprecatedOperand } from '@/types';
import { convertViewFilterOperandToCoreOperand } from '@/utils/filter/utils/convert-view-filter-operand-to-core-operand.util';
import { getStepFilterOperands } from '@/workflow/utils/getStepFilterOperands';
import { type WorkflowValidationIssue } from '@/workflow/validation/types/WorkflowValidation';

export const getUnsupportedStepFilterOperandIssues = ({
  stepFilters,
  subject,
  stepId,
}: {
  stepFilters: Pick<
    StepFilterWithPotentiallyDeprecatedOperand,
    'type' | 'operand' | 'compositeFieldSubFieldName'
  >[];
  subject: string;
  stepId?: string;
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

    return [
      {
        severity: 'error',
        code: 'UNSUPPORTED_STEP_FILTER_OPERAND',
        message: `${subject} has a ${stepFilter.type} filter with operand "${stepFilter.operand}", which is not supported for this filter type. Use one of: ${supportedOperands.join(', ')}.`,
        stepId,
      },
    ];
  });

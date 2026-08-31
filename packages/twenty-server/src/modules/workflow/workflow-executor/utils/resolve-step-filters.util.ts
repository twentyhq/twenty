import { type StepFilter } from 'twenty-shared/types';
import { resolveInput } from 'twenty-shared/utils';

import { resolveFilterValueAndOperand } from 'src/modules/workflow/workflow-executor/utils/resolve-filter-value-and-operand.util';

export const resolveStepFilters = ({
  stepFilters,
  context,
}: {
  stepFilters: StepFilter[];
  context: Record<string, unknown>;
}) =>
  stepFilters.map((stepFilter) => {
    const { value: rightOperand, operand } = resolveFilterValueAndOperand({
      value: stepFilter.value,
      operand: stepFilter.operand,
      context,
    });

    return {
      ...stepFilter,
      operand,
      rightOperand,
      leftOperand: resolveInput(stepFilter.stepOutputKey, context),
    };
  });

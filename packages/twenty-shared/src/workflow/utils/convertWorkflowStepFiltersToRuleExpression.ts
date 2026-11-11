import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { type StepFiltersToRuleExpressionConversionResult } from '@/workflow/types/StepFiltersToRuleExpressionConversionResult';
import { convertStepFilterTreeToRuleExpression } from '@/workflow/utils/internal/convertStepFilterTreeToRuleExpression';

// Same guarantee for a Filter or If/Else step, whose operands are {{stepId.path}}
// variables: the expression reads them as variable tokens, with the same resolver
export const convertWorkflowStepFiltersToRuleExpression = ({
  stepFilterGroups = [],
  stepFilters = [],
}: {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
}): StepFiltersToRuleExpressionConversionResult =>
  convertStepFilterTreeToRuleExpression({
    stepFilterGroups,
    stepFilters,
    operandSource: { type: 'WORKFLOW_VARIABLES' },
  });

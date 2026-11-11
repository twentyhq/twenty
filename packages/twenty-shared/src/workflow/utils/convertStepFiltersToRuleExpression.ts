import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from '@/types/StepFilters';
import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';
import { type StepFiltersToRuleExpressionConversionResult } from '@/workflow/types/StepFiltersToRuleExpressionConversionResult';
import { convertStepFilterTreeToRuleExpression } from '@/workflow/utils/internal/convertStepFilterTreeToRuleExpression';

// Converts a trigger filter only when the expression gives the legacy result for
// every record whose values have their field's shape; otherwise the caller keeps
// the legacy filter. The caller still compiles the expression against the fields.
export const convertStepFiltersToRuleExpression = ({
  stepFilterGroups = [],
  stepFilters = [],
  databaseEventAction,
}: {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
  databaseEventAction: ValidationRuleDatabaseEventAction;
}): StepFiltersToRuleExpressionConversionResult =>
  convertStepFilterTreeToRuleExpression({
    stepFilterGroups,
    stepFilters,
    operandSource: { type: 'TRIGGER_RECORD', databaseEventAction },
  });

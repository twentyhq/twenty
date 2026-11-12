import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { renameValidationRulePath } from '@/utils/validation-rule/renameValidationRulePath';
import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';

export const renameValidationRuleExpressionFields = ({
  expression,
  bindings,
  fieldNameByUniversalIdentifier,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): string =>
  tokenizeValidationRuleExpression(expression)
    .map((token) =>
      token.type === 'path'
        ? renameValidationRulePath({
            path: token.text,
            bindings,
            fieldNameByUniversalIdentifier,
          })
        : token.text,
    )
    .join('');

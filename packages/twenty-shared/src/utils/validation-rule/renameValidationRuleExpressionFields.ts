import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { renameValidationRulePath } from '@/utils/validation-rule/renameValidationRulePath';
import { tokenizeExpression } from '@/utils/expression/tokenizeExpression';

export const renameValidationRuleExpressionFields = ({
  expression,
  bindings,
  fieldNameByUniversalIdentifier,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): string =>
  tokenizeExpression(expression)
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

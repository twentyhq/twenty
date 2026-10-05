import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';

export const mapValidationRuleExpressionPaths = ({
  expression,
  mapPath,
}: {
  expression: string;
  mapPath: (path: string) => string;
}): string =>
  tokenizeValidationRuleExpression(expression)
    .map((token) => (token.type === 'path' ? mapPath(token.text) : token.text))
    .join('');

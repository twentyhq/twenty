import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';

const IDENTIFIER_PREFIX = '$variable';

export type ValidationRuleVariableReplacement = {
  source: string;
  variableByIdentifier: ReadonlyMap<string, string>;
};

// The parser has no syntax for {{…}}, so each variable is parsed as an identifier
// no field can take: field names never start with $, and the prefix grows until
// the expression does not already contain it
export const replaceValidationRuleVariables = (
  expression: string,
): ValidationRuleVariableReplacement => {
  let identifierPrefix = IDENTIFIER_PREFIX;

  while (expression.includes(identifierPrefix)) {
    identifierPrefix += '_';
  }

  const identifierByVariable = new Map<string, string>();

  const source = tokenizeValidationRuleExpression(expression)
    .map((token) => {
      if (token.type !== 'variable') {
        return token.text;
      }

      const identifier =
        identifierByVariable.get(token.text) ??
        `${identifierPrefix}${identifierByVariable.size}`;

      identifierByVariable.set(token.text, identifier);

      return identifier;
    })
    .join('');

  return {
    source,
    variableByIdentifier: new Map(
      [...identifierByVariable].map(([variable, identifier]) => [
        identifier,
        variable,
      ]),
    ),
  };
};

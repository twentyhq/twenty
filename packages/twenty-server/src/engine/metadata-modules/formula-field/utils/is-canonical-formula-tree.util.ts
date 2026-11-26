import isEqual from 'lodash.isequal';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaTree,
  isDefined,
  parseExpressionNode,
  printFieldMetadataFormula,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

const readsBackTheSame = ({
  tree,
  expression,
  fields,
}: {
  tree: unknown;
  expression: string | undefined;
  fields: ValidationRuleFieldDescriptor[];
}): boolean => {
  const parsing = isDefined(expression)
    ? parseExpressionNode(expression)
    : undefined;

  return (
    parsing?.isValid === true &&
    isEqual(
      resolveExpressionFieldReferences({ node: parsing.node, fields }),
      tree,
    )
  );
};

// A tree sent by a client is only accepted when printing and reading it back gives the same tree
export const isCanonicalFormulaTree = ({
  settings,
  fields,
}: {
  settings: unknown;
  fields: ValidationRuleFieldDescriptor[];
}): boolean => {
  try {
    const { expression, currencyCodeExpression } = printFieldMetadataFormula({
      settings,
      fields,
    });
    const currencyCodeTree = getFieldMetadataFormulaTree({
      settings,
      isCurrencyCode: true,
    });

    return (
      readsBackTheSame({
        tree: getFieldMetadataFormulaTree({ settings }),
        expression,
        fields,
      }) &&
      (!isDefined(currencyCodeTree) ||
        readsBackTheSame({
          tree: currencyCodeTree,
          expression: currencyCodeExpression,
          fields,
        }))
    );
  } catch {
    return false;
  }
};

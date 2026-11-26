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
  if (!isDefined(expression)) {
    return false;
  }

  const parsing = parseExpressionNode(expression);

  return (
    parsing.isValid &&
    isEqual(
      resolveExpressionFieldReferences({ node: parsing.node, fields }),
      tree,
    )
  );
};

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

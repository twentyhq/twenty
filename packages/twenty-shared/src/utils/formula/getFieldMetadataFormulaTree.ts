import { isString } from '@sniptt/guards';

import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const isExpressionNode = (value: unknown): value is ExpressionNode =>
  isPlainObject(value) && isString(value.type);

export const getFieldMetadataFormulaTree = ({
  settings,
  isCurrencyCode = false,
}: {
  settings?: unknown;
  isCurrencyCode?: boolean;
}): ExpressionNode | undefined => {
  if (!isPlainObject(settings) || !isPlainObject(settings.formula)) {
    return undefined;
  }

  const tree = isCurrencyCode
    ? settings.formula.currencyCodeTree
    : settings.formula.tree;

  return isExpressionNode(tree) ? tree : undefined;
};

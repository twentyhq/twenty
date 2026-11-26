import { isString } from '@sniptt/guards';

import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const toExpressionNode = (value: unknown): ExpressionNode | undefined =>
  isPlainObject(value) && isString(value.type)
    ? (value as unknown as ExpressionNode)
    : undefined;

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

  return toExpressionNode(
    isCurrencyCode ? settings.formula.currencyCodeTree : settings.formula.tree,
  );
};

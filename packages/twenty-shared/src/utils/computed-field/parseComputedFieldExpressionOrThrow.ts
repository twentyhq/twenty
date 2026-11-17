import { isString } from '@sniptt/guards';

import { COMPUTED_FIELD_EXPRESSION_MAX_LENGTH } from '@/constants/ComputedFieldExpressionMaxLength';
import { type ComputedFieldExpressionNode } from '@/types/ComputedFieldExpressionNode';
import { memoizeLeastRecentlyUsed } from '@/utils/cache/memoizeLeastRecentlyUsed';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { computedFieldExpressionParser } from '@/utils/computed-field/internal/computedFieldExpressionParser';
import { buildComputedFieldExpressionTreeOrThrow } from '@/utils/computed-field/internal/buildComputedFieldExpressionTreeOrThrow';

const PARSED_EXPRESSION_CACHE_MAX_SIZE = 500;

const parseOrThrow = memoizeLeastRecentlyUsed((expression) => {
  try {
    return buildComputedFieldExpressionTreeOrThrow(
      computedFieldExpressionParser.parse(expression).tokens,
    );
  } catch (error) {
    throw new ComputedFieldExpressionError(
      error instanceof Error ? error.message : 'The expression cannot be read',
    );
  }
}, PARSED_EXPRESSION_CACHE_MAX_SIZE);

export const parseComputedFieldExpressionOrThrow = (
  expression: string,
): ComputedFieldExpressionNode => {
  if (!isString(expression) || expression.trim().length === 0) {
    throw new ComputedFieldExpressionError('The expression is empty');
  }

  if (expression.length > COMPUTED_FIELD_EXPRESSION_MAX_LENGTH) {
    throw new ComputedFieldExpressionError(
      `The expression is longer than ${COMPUTED_FIELD_EXPRESSION_MAX_LENGTH} characters`,
    );
  }

  return parseOrThrow(expression);
};

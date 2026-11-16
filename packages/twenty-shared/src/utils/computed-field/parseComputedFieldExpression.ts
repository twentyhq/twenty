import { memoizeLeastRecentlyUsed } from '@/utils/cache/memoizeLeastRecentlyUsed';
import { computedFieldExpressionParser } from '@/utils/computed-field/computedFieldExpressionParser';

const PARSED_EXPRESSION_CACHE_MAX_SIZE = 500;

export const parseComputedFieldExpression = memoizeLeastRecentlyUsed(
  (source) => computedFieldExpressionParser.parse(source),
  PARSED_EXPRESSION_CACHE_MAX_SIZE,
);

import { memoizeLeastRecentlyUsed } from '@/utils/cache/memoizeLeastRecentlyUsed';
import { validationRuleParser } from '@/utils/validation-rule/validationRuleParser';

const PARSED_EXPRESSION_CACHE_MAX_SIZE = 500;

export const parseValidationRuleExpression = memoizeLeastRecentlyUsed(
  (source) => validationRuleParser.parse(source),
  PARSED_EXPRESSION_CACHE_MAX_SIZE,
);

import { memoizeLeastRecentlyUsed } from '@/utils/cache/memoizeLeastRecentlyUsed';
import { validationRuleParser } from '@/utils/validation-rule/validationRuleParser';

const PARSED_EXPRESSION_CACHE_MAX_SIZE = 500;

export const parseValidationRuleExpression = memoizeLeastRecentlyUsed({
  compute: (source) => validationRuleParser.parse(source),
  maxEntries: PARSED_EXPRESSION_CACHE_MAX_SIZE,
});

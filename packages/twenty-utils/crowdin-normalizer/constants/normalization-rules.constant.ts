import { ESCAPED_INLINE_CODE_TAGS_RULE } from '../rules/escaped-inline-code-tags.rule';
import { ESCAPED_UNICODE_RULE } from '../rules/escaped-unicode.rule';
import { type NormalizationRule } from '../types/normalization-rule.type';

export const NORMALIZATION_RULES: NormalizationRule[] = [
  ESCAPED_UNICODE_RULE,
  ESCAPED_INLINE_CODE_TAGS_RULE,
];

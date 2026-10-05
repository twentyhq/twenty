import { CORRUPTED_MODEL_OUTPUT_RULE } from '../rules/corrupted-model-output.rule';
import { ESCAPED_EVERY_CHARACTER_RULE } from '../rules/escaped-every-character.rule';
import { ESCAPED_INLINE_CODE_TAGS_RULE } from '../rules/escaped-inline-code-tags.rule';
import { ESCAPED_UNICODE_RULE } from '../rules/escaped-unicode.rule';
import { INVENTED_ARGUMENT_RULE } from '../rules/invented-argument.rule';
import { INVENTED_MARKUP_RULE } from '../rules/invented-markup.rule';
import { TRANSLATED_IDENTIFIER_RULE } from '../rules/translated-identifier.rule';
import { WORDLESS_TRANSLATION_RULE } from '../rules/wordless-translation.rule';
import { type NormalizationRule } from '../types/normalization-rule.type';

export const NORMALIZATION_RULES: NormalizationRule[] = [
  ESCAPED_UNICODE_RULE,
  ESCAPED_EVERY_CHARACTER_RULE,
  ESCAPED_INLINE_CODE_TAGS_RULE,
  CORRUPTED_MODEL_OUTPUT_RULE,
  INVENTED_MARKUP_RULE,
  INVENTED_ARGUMENT_RULE,
  WORDLESS_TRANSLATION_RULE,
  TRANSLATED_IDENTIFIER_RULE,
];

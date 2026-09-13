import { type NormalizationRule } from '../types/normalization-rule.type';

// Any markup tag, including Lingui's numbered ones (<0>), so a source carrying
// tags of its own is left entirely alone.
const TAG_PATTERN = '<\\/?[A-Za-z0-9][^<>]*>';
const TAG_REGEX = new RegExp(TAG_PATTERN);
const ALL_TAGS_REGEX = new RegExp(TAG_PATTERN, 'g');

// The machine translator sometimes decorates a plain string with markup of its
// own - RTL spans, bold around numbers, highlight spans - which the reader then
// sees as literal tags.
function hasInventedMarkup(text: string, sourceText?: string): boolean {
  return (
    sourceText !== undefined &&
    !TAG_REGEX.test(sourceText) &&
    TAG_REGEX.test(text)
  );
}

// Stripping everything leaves nothing to say, and the empty result drops the
// translation rather than shipping a blank string.
function removeInventedMarkup(text: string): string {
  return text.replace(ALL_TAGS_REGEX, '').trim();
}

export const INVENTED_MARKUP_RULE: NormalizationRule = {
  name: 'invented-markup',
  needsSourceText: true,
  detect: hasInventedMarkup,
  fix: removeInventedMarkup,
};

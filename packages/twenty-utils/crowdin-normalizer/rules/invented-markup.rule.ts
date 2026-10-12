import { type NormalizationRule } from '../types/normalization-rule.type';

// Includes Lingui's numbered tags (<0>), so a source with tags of its own is left alone.
const TAG_PATTERN = '<\\/?[A-Za-z0-9][^<>]*>';
const TAG_REGEX = new RegExp(TAG_PATTERN);
const ALL_TAGS_REGEX = new RegExp(TAG_PATTERN, 'g');

// The machine translator sometimes adds markup (RTL spans, bold numbers) the reader then sees as literal tags.
function hasInventedMarkup(text: string, sourceText?: string): boolean {
  return (
    sourceText !== undefined &&
    !TAG_REGEX.test(sourceText) &&
    TAG_REGEX.test(text)
  );
}

function removeInventedMarkup(text: string): string {
  return text.replace(ALL_TAGS_REGEX, '').trim();
}

export const INVENTED_MARKUP_RULE: NormalizationRule = {
  name: 'invented-markup',
  formats: ['po'],
  needsSourceText: true,
  detect: hasInventedMarkup,
  fix: removeInventedMarkup,
};

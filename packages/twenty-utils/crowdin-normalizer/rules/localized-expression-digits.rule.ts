import { type NormalizationRule } from '../types/normalization-rule.type';

// JSX attribute expressions are code, so a translated digit there (`cols={٢}`) breaks the MDX parse.
const ATTRIBUTE_EXPRESSION_REGEX = /=\{[^{}\n]*\}/g;

const LOCALIZED_DIGIT_REGEX = /(?![0-9])\p{Nd}/gu;

const DECIMAL_DIGIT_REGEX = /^\p{Nd}$/u;

function isDecimalDigit(codePoint: number): boolean {
  return DECIMAL_DIGIT_REGEX.test(String.fromCodePoint(codePoint));
}

// Unicode lays out every decimal digit set as runs of ten code points starting at zero.
function toAsciiDigit(digit: string): string {
  const codePoint = digit.codePointAt(0) ?? 0;
  let runStart = codePoint;

  while (isDecimalDigit(runStart - 1)) {
    runStart--;
  }

  return String((codePoint - runStart) % 10);
}

function hasLocalizedExpressionDigits(text: string): boolean {
  return [...text.matchAll(ATTRIBUTE_EXPRESSION_REGEX)].some(([expression]) =>
    new RegExp(LOCALIZED_DIGIT_REGEX).test(expression),
  );
}

function restoreExpressionDigits(text: string): string {
  return text.replace(ATTRIBUTE_EXPRESSION_REGEX, (expression) =>
    expression.replace(LOCALIZED_DIGIT_REGEX, toAsciiDigit),
  );
}

export const LOCALIZED_EXPRESSION_DIGITS_RULE: NormalizationRule = {
  name: 'localized-expression-digits',
  formats: ['mdx'],
  detect: hasLocalizedExpressionDigits,
  fix: restoreExpressionDigits,
};

import { type NormalizationRule } from '../types/normalization-rule.type';

const ESCAPED_UNICODE_REGEX = /\\u[0-9a-fA-F]{4}/;

function unescapeUnicode(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

export const ESCAPED_UNICODE_RULE: NormalizationRule = {
  name: 'escaped-unicode',
  detect: (text) => ESCAPED_UNICODE_REGEX.test(text),
  fix: unescapeUnicode,
};

import { ESCAPED_UNICODE_RULE } from '../escaped-unicode.rule';

const { detect, fix } = ESCAPED_UNICODE_RULE;

describe('ESCAPED_UNICODE_RULE', () => {
  it('restores characters that leaked as literal \\uXXXX sequences', () => {
    const translationText = '\\u62db\\u8058';

    expect(detect(translationText)).toBe(true);
    expect(fix(translationText)).toBe('招聘');
  });

  it('restores surrogate pairs', () => {
    expect(fix('ok \\ud83d\\ude00')).toBe('ok 😀');
  });

  it('applies to any string, since the corruption can appear anywhere', () => {
    expect(ESCAPED_UNICODE_RULE.sourceFilter).toBeUndefined();
    expect(fix('\\u00e9')).toBe('é');
  });

  it('leaves text without escaped sequences untouched', () => {
    expect(detect('招聘')).toBe(false);
  });

  it('is idempotent', () => {
    const once = fix('\\u62db');

    expect(fix(once)).toBe(once);
  });
});

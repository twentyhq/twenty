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

  it('keeps an escape the source writes itself, such as a code sample', () => {
    const sourceText = 'Escape the accent as \\u00e9 in the config';
    const translationText = 'Echappez l\'accent en \\u00e9 dans la configuration';

    expect(detect(translationText, sourceText)).toBe(false);
    expect(fix(translationText, sourceText)).toBe(translationText);
  });

  it('still decodes an escape the source does not carry', () => {
    const sourceText = 'Recruiting';

    expect(detect('\\u62db\\u8058', sourceText)).toBe(true);
    expect(fix('\\u62db\\u8058', sourceText)).toBe('招聘');
  });

  it('decodes only the escapes the source does not carry', () => {
    const sourceText = 'Use \\u00e9 here';

    expect(fix('Utilisez \\u00e9 ici \\u62db', sourceText)).toBe(
      'Utilisez \\u00e9 ici 招',
    );
  });

  it('is idempotent', () => {
    const once = fix('\\u62db');

    expect(fix(once)).toBe(once);
  });
});

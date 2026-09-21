import { ESCAPED_UNICODE_RULE } from '../escaped-unicode.rule';

const { detect, fix } = ESCAPED_UNICODE_RULE;

describe('ESCAPED_UNICODE_RULE', () => {
  it('restores characters that leaked as literal \\uXXXX sequences', () => {
    const translationText = '\\u62db\\u8058';

    expect(detect(translationText, 'Recruiting')).toBe(true);
    expect(fix(translationText, 'Recruiting')).toBe('招聘');
  });

  it('restores surrogate pairs', () => {
    expect(fix('ok \\ud83d\\ude00', 'ok 😀')).toBe('ok 😀');
  });

  it('keeps an escape the source writes itself, such as a code sample', () => {
    const sourceText = 'Escape the accent as \\u00e9 in the config';
    const translationText =
      "Echappez l'accent en \\u00e9 dans la configuration";

    expect(detect(translationText, sourceText)).toBe(false);
    expect(fix(translationText, sourceText)).toBe(translationText);
  });

  it('decodes only the escapes the source does not carry', () => {
    const sourceText = 'Use \\u00e9 here';

    expect(fix('Utilisez \\u00e9 ici \\u62db', sourceText)).toBe(
      'Utilisez \\u00e9 ici 招',
    );
  });

  it('stands down when the source is unknown, rather than decoding blind', () => {
    expect(detect('\\u62db\\u8058', undefined)).toBe(false);
    expect(fix('\\u62db\\u8058', undefined)).toBe('\\u62db\\u8058');
  });

  it('scans every string rather than filtering by source', () => {
    expect(ESCAPED_UNICODE_RULE.sourceFilter).toBeUndefined();
    expect(ESCAPED_UNICODE_RULE.needsSourceText).toBe(true);
  });

  it('leaves text without escaped sequences untouched', () => {
    expect(detect('招聘', 'Recruiting')).toBe(false);
  });

  it('is idempotent', () => {
    const once = fix('\\u62db', 'Recruiting');

    expect(detect(once, 'Recruiting')).toBe(false);
    expect(fix(once, 'Recruiting')).toBe(once);
  });
});

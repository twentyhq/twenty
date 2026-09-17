import { WORDLESS_TRANSLATION_RULE } from '../wordless-translation.rule';

const { detect, fix } = WORDLESS_TRANSLATION_RULE;

describe('WORDLESS_TRANSLATION_RULE', () => {
  it('drops a translation that is a lone backslash', () => {
    expect(detect('\\', 'The values of this field must be unique')).toBe(true);
    expect(fix('\\', 'The values of this field must be unique')).toBe('');
  });

  it('drops a translation that is an escaped quote pair', () => {
    expect(detect("''", 'Count false')).toBe(true);
    expect(fix("''", 'Count false')).toBe('');
  });

  it('drops punctuation and whitespace debris', () => {
    expect(detect('  .,;  ', 'Regenerate key')).toBe(true);
  });

  // \w is ASCII-only in JavaScript, so a naive check would delete every
  // translation in a non-Latin script.
  it.each([
    ['他們的值必須是唯一的', 'Chinese'],
    ['הערכים חייבים להיות ייחודיים', 'Hebrew'],
    ['القيم يجب أن تكون فريدة', 'Arabic'],
    ['Значения должны быть уникальными', 'Cyrillic'],
    ['Արժեքներըպետք է եզակի լինեն', 'Armenian'],
    ['値は一意である必要があります', 'Japanese'],
  ])('keeps %s (%s)', (translationText) => {
    expect(detect(translationText, 'The values must be unique')).toBe(false);
  });

  it('keeps a translation that is only digits, which are words enough', () => {
    expect(detect('2026', 'Year')).toBe(false);
  });

  it('keeps a wordless translation when the source has no words either', () => {
    expect(detect('—', '—')).toBe(false);
    expect(detect(':', ':')).toBe(false);
  });

  it('keeps a translation that is only a placeholder, as its source is', () => {
    expect(detect('{count}', '{count}')).toBe(false);
  });

  // Ignoring placeholder names would catch a translation left as a bare
  // {count}, but a dry run over ~200k strings found none of those and two
  // Finnish translations that legitimately render a connector word as a
  // symbol. Deleting a good translation is worse than keeping a thin one, so
  // the rule reads the whole string.
  it('keeps a translation that renders a connector word as a symbol', () => {
    expect(detect('{0} / {1}', '{0} of {1}')).toBe(false);
    expect(detect(' /{intervalLabel}', ' per {intervalLabel}')).toBe(false);
  });

  it('stands down when the source is unknown, rather than deleting blind', () => {
    expect(detect('\\', undefined)).toBe(false);
  });

  it('leaves a translation already dropped by an earlier rule alone', () => {
    expect(detect('', 'Regenerate key')).toBe(false);
  });

  it('scans every string rather than filtering by source', () => {
    expect(WORDLESS_TRANSLATION_RULE.sourceFilter).toBeUndefined();
    expect(WORDLESS_TRANSLATION_RULE.needsSourceText).toBe(true);
  });

  it('runs against PO catalogs only', () => {
    expect(WORDLESS_TRANSLATION_RULE.formats).toEqual(['po']);
  });
});

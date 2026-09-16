import { ESCAPED_EVERY_CHARACTER_RULE } from '../escaped-every-character.rule';

const { detect, fix } = ESCAPED_EVERY_CHARACTER_RULE;

describe('ESCAPED_EVERY_CHARACTER_RULE', () => {
  it.each([
    ['\\ا\\ل\\إ\\ع\\د\\ا\\د\\ا\\ت', 'الإعدادات'],
    ['\\ダ\\ー\\ク', 'ダーク'],
    ['\\明\\る\\い', '明るい'],
    ['\\S\\e\\t\\t\\i\\n\\g\\s', 'Settings'],
  ])(
    'unescapes a message escaped character by character: %s',
    (text, expected) => {
      expect(detect(text)).toBe(true);
      expect(fix(text)).toBe(expected);
    },
  );

  // A path or a regex carries a few backslashes among ordinary text, which is
  // the translator writing what the source asked for.
  it.each([
    'C:\\Users\\name\\file',
    'Escape it as \\n to break the line',
    'Matches \\d followed by \\w in the pattern',
    'Réglages',
    '',
    '\\',
  ])('leaves a message whose backslashes are its content: %s', (text) => {
    expect(detect(text)).toBe(false);
    expect(fix(text)).toBe(text);
  });

  it('needs more than a couple of escapes before it acts', () => {
    expect(detect('\\a\\b')).toBe(false);
    expect(fix('\\a\\b')).toBe('\\a\\b');
  });

  it('runs against both catalog formats and needs no source text', () => {
    expect(ESCAPED_EVERY_CHARACTER_RULE.formats).toEqual(['po', 'mdx']);
    expect(ESCAPED_EVERY_CHARACTER_RULE.needsSourceText).toBeUndefined();
  });
});

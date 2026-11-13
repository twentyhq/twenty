import { CONTROL_CHARACTERS_RULE } from '../control-characters.rule';

const { detect, fix } = CONTROL_CHARACTERS_RULE;

describe('CONTROL_CHARACTERS_RULE', () => {
  it('drops a translation led by a NUL byte and catalog debris', () => {
    const translationText = '\u0000":["Не пусто"]';

    expect(detect(translationText, ': NotEmpty')).toBe(true);
    expect(fix(translationText, ': NotEmpty')).toBe('');
  });

  it.each([
    ['Permetre l\u000027exportaci\u0000f3 de dades', 'Allow exporting data'],
    ['Navr\u0017een\u0000e9', 'Suggested'],
    ['Champ de vue \u00021e delete \u00022non trouv\u00007e', 'View field'],
    ['\u007f\u0000תאימות', 'Option values'],
  ])('drops mis-decoded escapes in %j', (translationText, sourceText) => {
    expect(detect(translationText, sourceText)).toBe(true);
  });

  it('keeps tabs and line breaks', () => {
    expect(detect('Ligne un\nLigne\tdeux\r\n', 'Line one\nLine two')).toBe(
      false,
    );
  });

  it('keeps a control character the source carries itself', () => {
    expect(detect('Séparateur \u001f ici', 'Separator \u001f here')).toBe(
      false,
    );
  });

  it('stands down when the source is unknown, rather than deleting blind', () => {
    expect(detect('\u0000abc', undefined)).toBe(false);
  });

  it('leaves clean translations and already dropped ones alone', () => {
    expect(detect(': Не пусто', ': NotEmpty')).toBe(false);
    expect(detect('', ': NotEmpty')).toBe(false);
  });

  it('runs against PO catalogs only', () => {
    expect(CONTROL_CHARACTERS_RULE.formats).toEqual(['po']);
  });
});

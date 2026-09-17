import { TRANSLATED_IDENTIFIER_RULE } from '../translated-identifier.rule';

const { detect, fix } = TRANSLATED_IDENTIFIER_RULE;

describe('TRANSLATED_IDENTIFIER_RULE', () => {
  it('restores a code identifier translated inside backticks', () => {
    const sourceText =
      'Re-renders are often caused by unnecessary `useEffect`.';
    const translationText =
      'وكثيرا ما تكون عمليات إعادة التسليم ناجمة عن `فعالية الاستخدام` غير الضرورية.';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe(
      'وكثيرا ما تكون عمليات إعادة التسليم ناجمة عن `useEffect` غير الضرورية.',
    );
  });

  // A translation reorders spans to suit its own grammar, so position says
  // nothing about which source span belongs in which slot.
  it('stands down on more than one span, where order cannot be trusted', () => {
    const sourceText =
      'The `twenty-app` keyword in your `package.json` `keywords` array';
    const translationText =
      'Cuvântul cheie `twenty-app` din array-ul `keywords` al fișierului `package.json`';

    expect(detect(translationText, sourceText)).toBe(false);
    expect(fix(translationText, sourceText)).toBe(translationText);
  });

  // Backticks in the docs mark UI labels as often as symbols, and the reader
  // sees those labels translated in their own app, so restoring them would
  // un-translate correct work.
  it.each([
    [
      'Go to `Settings` in the left sidebar.',
      'Accesați `Setări` din bara laterală stângă.',
    ],
    [
      'Go to `Data Model`, then select the object.',
      'Accesați `Model de date`, apoi selectați obiectul.',
    ],
    [
      'Select `Deactivate` from the dropdown.',
      'Selectați `Dezactivează` din lista derulantă.',
    ],
  ])('keeps a translated UI label: %s', (sourceText, translationText) => {
    expect(detect(translationText, sourceText)).toBe(false);
    expect(fix(translationText, sourceText)).toBe(translationText);
  });

  it.each([
    [
      'Caused by `useEffect`.',
      'Cauzat de `efectul de utilizare`.',
      'Cauzat de `useEffect`.',
    ],
    [
      'Fields of type `SELECT`.',
      'Câmpuri de tip `SELECTARE`.',
      'Câmpuri de tip `SELECT`.',
    ],
    [
      'Set `is_auth_required`.',
      'Setați `este_necesară_autentificarea`.',
      'Setați `is_auth_required`.',
    ],
    [
      'Call `client.run()`.',
      'Apelați `client.rulează()`.',
      'Apelați `client.run()`.',
    ],
    [
      'Build the `twenty-emails` package first.',
      'Vous devez construire le paquet `vingt-emails`.',
      'Vous devez construire le paquet `twenty-emails`.',
    ],
    [
      'Send the `x-slack-signature` header.',
      'Trimiteți antetul `x-semnătură-slack`.',
      'Trimiteți antetul `x-slack-signature`.',
    ],
  ])(
    'restores an identifier-shaped span: %s',
    (sourceText, translationText, expected) => {
      expect(detect(translationText, sourceText)).toBe(true);
      expect(fix(translationText, sourceText)).toBe(expected);
    },
  );

  // Lining them up positionally is only sound when both sides hold the same
  // number; a translation that dropped or added one cannot be matched safely.
  it('stands down when the counts do not line up', () => {
    const sourceText = 'Use `a` and `b`.';

    expect(detect('Utilisez `x`.', sourceText)).toBe(false);
    expect(fix('Utilisez `x`.', sourceText)).toBe('Utilisez `x`.');
  });

  it('leaves a translation whose identifiers already match', () => {
    const sourceText = 'Call `useEffect` from [here](/docs/a).';
    const translationText = 'Appelez `useEffect` depuis [ici](/docs/a).';

    expect(detect(translationText, sourceText)).toBe(false);
  });

  // Translated pages live under /l/<lang>/ and link to each other there, so a
  // locale-prefixed target is the translation being right, not wrong. Paths and
  // link targets are left to a human.
  it('leaves link targets alone, including locale-prefixed ones', () => {
    const sourceText = 'See [the guide](/user-guide/billing).';
    const translationText = 'Vezi [ghidul](/l/ro/user-guide/billing).';

    expect(detect(translationText, sourceText)).toBe(false);
    expect(fix(translationText, sourceText)).toBe(translationText);
  });

  it('stands down when the source is unknown', () => {
    expect(detect('`useEffect`', undefined)).toBe(false);
    expect(fix('`useEffect`', undefined)).toBe('`useEffect`');
  });

  it('runs against MDX catalogs only', () => {
    expect(TRANSLATED_IDENTIFIER_RULE.formats).toEqual(['mdx']);
    expect(TRANSLATED_IDENTIFIER_RULE.needsSourceText).toBe(true);
  });
});

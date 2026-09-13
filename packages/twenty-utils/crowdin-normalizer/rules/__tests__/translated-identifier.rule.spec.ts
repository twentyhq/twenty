import { TRANSLATED_IDENTIFIER_RULE } from '../translated-identifier.rule';

const { detect, fix } = TRANSLATED_IDENTIFIER_RULE;

describe('TRANSLATED_IDENTIFIER_RULE', () => {
  it('restores a route translated into the target language', () => {
    const sourceText = '/user-guide/billing/capabilities/pricing-plans';
    const translationText = '/user-guide/billing/القدرات/خطط التسعير';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe(sourceText);
  });

  it('restores a route the translation misspelled', () => {
    const sourceText = '/user-guide/billing/how-tos/billing-faq';

    expect(fix('/userer-guide/billing/how-tos/billing-faq', sourceText)).toBe(
      sourceText,
    );
  });

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

  it('restores each code span in order, leaving the prose alone', () => {
    const sourceText = 'Call `useMemo` before `useEffect` runs.';
    const translationText = 'Appelez `useMémo` avant que `useEffet` ne tourne.';

    expect(fix(translationText, sourceText)).toBe(
      'Appelez `useMemo` avant que `useEffect` ne tourne.',
    );
  });

  it('restores a link target while keeping the translated link text', () => {
    const sourceText = 'See the [billing guide](/user-guide/billing) for more.';
    const translationText =
      'Consultez le [guide de facturation](/guide-utilisateur/facturation) pour en savoir plus.';

    expect(fix(translationText, sourceText)).toBe(
      'Consultez le [guide de facturation](/user-guide/billing) pour en savoir plus.',
    );
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

  it('does not treat translated prose as a path', () => {
    expect(detect('Facturation', 'Billing')).toBe(false);
  });

  it('stands down when the source is unknown', () => {
    expect(detect('/traduit', undefined)).toBe(false);
    expect(fix('/traduit', undefined)).toBe('/traduit');
  });

  it('runs against MDX catalogs only', () => {
    expect(TRANSLATED_IDENTIFIER_RULE.formats).toEqual(['mdx']);
    expect(TRANSLATED_IDENTIFIER_RULE.needsSourceText).toBe(true);
  });
});

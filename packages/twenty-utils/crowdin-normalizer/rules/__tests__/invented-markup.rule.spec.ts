import { INVENTED_MARKUP_RULE } from '../invented-markup.rule';

const { detect, fix } = INVENTED_MARKUP_RULE;

describe('INVENTED_MARKUP_RULE', () => {
  it('strips a highlight span the source never had', () => {
    const sourceText = 'is not a valid calling code';
    const translationText =
      'n\'est pas un <span class="highlight">code d\'appel valide</span>';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe(
      "n'est pas un code d'appel valide",
    );
  });

  it('strips nested direction spans', () => {
    const translationText =
      '<span dir="rtl"><span dir="ltr">כשל זמני</span></span>';

    expect(fix(translationText, 'Temporary Failure')).toBe('כשל זמני');
  });

  it('strips bold added around numbers and punctuation', () => {
    expect(fix('過去<b>12</b>時間', 'Last 12 hours')).toBe('過去12時間');
    expect(fix('API名<b>（</b>単数形<b>）</b>', 'API Name (Singular)')).toBe(
      'API名（単数形）',
    );
  });

  it('leaves a translation alone when the source carries markup of its own', () => {
    const sourceText = 'Your workspace <0>{name}</0> was deleted.';
    const translationText = 'Ваш простор <0>{name}</0> је обрисан.';

    expect(detect(translationText, sourceText)).toBe(false);
  });

  it('leaves a Lingui-tagged source alone even when the translation uses html', () => {
    expect(detect('Votre <b>espace</b>', 'Your <0>workspace</0>')).toBe(false);
  });

  it('does not flag a plain translation, a comparison, or a missing source', () => {
    expect(detect('Rechercher', 'Search')).toBe(false);
    expect(detect('moins de < 5 minutes', 'less than < 5 minutes')).toBe(false);
    expect(detect('<b>Recherche</b>', undefined)).toBe(false);
  });

  it('is idempotent', () => {
    const once = fix('過去<b>4</b>時間', 'Last 4 hours');

    expect(detect(once, 'Last 4 hours')).toBe(false);
    expect(fix(once, 'Last 4 hours')).toBe(once);
  });
});

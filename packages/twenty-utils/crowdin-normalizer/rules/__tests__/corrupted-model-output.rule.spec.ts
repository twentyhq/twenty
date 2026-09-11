import { CORRUPTED_MODEL_OUTPUT_RULE } from '../corrupted-model-output.rule';

const { detect, fix } = CORRUPTED_MODEL_OUTPUT_RULE;

describe('CORRUPTED_MODEL_OUTPUT_RULE', () => {
  it('cuts a leaked response envelope off a plain translation', () => {
    const sourceText = 'Group name';
    const translationText =
      'Nome do grupo}]}``` }}} code block? Wait. We messed up.';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe('Nome do grupo');
  });

  it('cuts a trailing JSON array separator', () => {
    expect(detect('レコードテーブルを編集},{', 'Edit Record Table')).toBe(true);
    expect(fix('レコードテーブルを編集},{', 'Edit Record Table')).toBe(
      'レコードテーブルを編集',
    );
  });

  it('keeps a plural block intact while dropping the envelope after it', () => {
    const sourceText =
      '{hiddenFieldCount, plural, one {# more populated field available} other {# more populated fields available}}';
    const translationText =
      '{hiddenFieldCount, plural, other {還有 # 個已填入欄位可用}}}]}દાવાદ്?ฤศจassistant to=developer';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe(
      '{hiddenFieldCount, plural, other {還有 # 個已填入欄位可用}}',
    );
  });

  it('keeps a closing quote the source also ends with', () => {
    const sourceText = 'Set fields created in the future as "visible"';
    const translationText =
      'Aseta tulevaisuudessa luotavat kentät "näkyviksi"}]}``` }]} } } }';

    expect(fix(translationText, sourceText)).toBe(
      'Aseta tulevaisuudessa luotavat kentät "näkyviksi"',
    );
  });

  it('drops a trailing apostrophe the source does not carry', () => {
    const sourceText = 'An error occurred';

    expect(fix("'n Fout het voorgekom'}]}```}``` }```{", sourceText)).toBe(
      "'n Fout het voorgekom",
    );
  });

  it('deletes a translation whose salvageable prefix is still envelope', () => {
    const sourceText = 'Trigger';
    const translationText = 'הפעל","pluralForm":null}]}]}{';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe('');
  });

  it('deletes a translation with an unclosed brace and no clean cut', () => {
    expect(fix('Nome do grupo {broken', 'Group name')).toBe('');
  });

  it('keeps markdown links when the source carries them too', () => {
    const sourceText = 'See [Getting Started](https://twenty.com/docs) first.';
    const translationText =
      'Consulte [Introdução](https://twenty.com/docs) primeiro.},{';

    expect(fix(translationText, sourceText)).toBe(
      'Consulte [Introdução](https://twenty.com/docs) primeiro.',
    );
  });

  it('does not flag a healthy translation', () => {
    expect(detect('Nome do grupo', 'Group name')).toBe(false);
    expect(
      detect(
        '{count, plural, other {# champs}}',
        '{count, plural, one {# field} other {# fields}}',
      ),
    ).toBe(false);
  });

  it('does not flag when the source is unavailable', () => {
    expect(detect('Nome do grupo}]}', undefined)).toBe(false);
  });

  it('does not flag when the source is itself unbalanced', () => {
    expect(detect('Algo}', 'Something}')).toBe(false);
  });

  it('is idempotent', () => {
    const sourceText = 'Group name';
    const once = fix('Nome do grupo}]}``` }}}', sourceText);

    expect(detect(once, sourceText)).toBe(false);
    expect(fix(once, sourceText)).toBe(once);
  });
});

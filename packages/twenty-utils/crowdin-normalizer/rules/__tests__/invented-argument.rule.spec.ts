import { INVENTED_ARGUMENT_RULE } from '../invented-argument.rule';

const { detect, fix } = INVENTED_ARGUMENT_RULE;

describe('INVENTED_ARGUMENT_RULE', () => {
  it('restores the source spelling of a recased argument', () => {
    const sourceText =
      'Multiple records found for {conflictingFieldsValues}. Cannot determine which record to update.';
    const translationText =
      '{ConflictingFieldsValues} のために複数のレコードが見つかりました。';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe(
      '{conflictingFieldsValues} のために複数のレコードが見つかりました。',
    );
  });

  it('deletes a translation that pluralises an argument-less source', () => {
    const sourceText = 'Record(s) selected';
    const translationText =
      '{count, plural, one {# registro selecionado} other {# registros selecionados}}';

    expect(detect(translationText, sourceText)).toBe(true);
    expect(fix(translationText, sourceText)).toBe('');
  });

  it('deletes a translation that adds an argument nothing will supply', () => {
    const sourceText = 'We keep your data for {dataRetentionDays} days.';
    const translationText =
      'Чувамо податке {dataRetentionDays} {dayOrDays}.';

    expect(fix(translationText, sourceText)).toBe('');
  });

  it('allows a translation to add plural cases its locale needs', () => {
    const sourceText = '{count, plural, one {# record} other {# records}}';
    const translationText =
      '{count, plural, one {# запись} few {# записи} many {# записей} other {# записи}}';

    expect(detect(translationText, sourceText)).toBe(false);
  });

  it('does not read plural case bodies as arguments', () => {
    const sourceText = '{unitCount, plural, one {Day} other {Days}}';
    const translationText = '{unitCount, plural, one {Dag} other {Dae}}';

    expect(detect(translationText, sourceText)).toBe(false);
  });

  it('does not flag a matching translation or a missing source', () => {
    expect(detect('Supprimer {name}', 'Delete {name}')).toBe(false);
    expect(detect('Supprimer {objet}', undefined)).toBe(false);
  });

  it('ignores a dropped argument, which it cannot repair', () => {
    expect(detect('Supprimer', 'Delete {name}')).toBe(false);
  });

  it('is idempotent', () => {
    const sourceText = 'Found for {conflictingFieldsValues}.';
    const once = fix('{ConflictingFieldsValues} で見つかりました。', sourceText);

    expect(detect(once, sourceText)).toBe(false);
    expect(fix(once, sourceText)).toBe(once);
  });
});

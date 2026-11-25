import { keepExistingFormulaInSettingsUpdate } from 'src/engine/metadata-modules/field-metadata/tools/utils/keep-existing-formula-in-settings-update.util';

const EXISTING_SETTINGS = {
  decimals: 0,
  formula: { expression: 'count(tasks)', evaluation: 'STORED' },
};

describe('keepExistingFormulaInSettingsUpdate', () => {
  it('should keep the existing formula when the update leaves it out', () => {
    expect(
      keepExistingFormulaInSettingsUpdate({
        settings: { decimals: 2 },
        existingSettings: EXISTING_SETTINGS,
      }),
    ).toEqual({ decimals: 2, formula: EXISTING_SETTINGS.formula });
  });

  it('should apply a formula sent with the update', () => {
    expect(
      keepExistingFormulaInSettingsUpdate({
        settings: { formula: { expression: 'count(tasks) * 2' } },
        existingSettings: EXISTING_SETTINGS,
      }),
    ).toEqual({ formula: { expression: 'count(tasks) * 2' } });
  });

  it('should remove the formula when the update sends it as null', () => {
    expect(
      keepExistingFormulaInSettingsUpdate({
        settings: { formula: null },
        existingSettings: EXISTING_SETTINGS,
      }),
    ).toEqual({ formula: null });
  });

  it('should leave the settings of a field without formula as sent', () => {
    expect(
      keepExistingFormulaInSettingsUpdate({
        settings: { decimals: 2 },
        existingSettings: { decimals: 0 },
      }),
    ).toEqual({ decimals: 2 });
  });
});

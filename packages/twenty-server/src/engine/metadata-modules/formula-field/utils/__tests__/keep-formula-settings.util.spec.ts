import { keepFormulaSettings } from 'src/engine/metadata-modules/formula-field/utils/keep-formula-settings.util';

describe('keepFormulaSettings', () => {
  it('should keep a formula sent as a tree, as the API returns it', () => {
    const tree = {
      type: 'FIELD',
      fieldUniversalIdentifier: 'gadget-stage-uid',
    };

    expect(
      keepFormulaSettings({
        formula: { tree, evaluation: 'STORED' },
        other: 1,
      }),
    ).toEqual({ formula: { tree } });
  });

  it('should keep a formula sent as text and drop a field without formula', () => {
    expect(keepFormulaSettings({ formula: { expression: 'stage' } })).toEqual({
      formula: { expression: 'stage' },
    });
    expect(keepFormulaSettings({ other: 1 })).toBeNull();
  });
});

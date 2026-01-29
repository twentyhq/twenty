import { removeStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/remove-standard-override.util';

describe('removeStandardOverride', () => {
  it('should return null when overrides is null', () => {
    const result = removeStandardOverride({
      overrides: null,
      property: 'labelSingular',
    });

    expect(result).toBeNull();
  });

  it('should return unchanged overrides when property does not exist', () => {
    const overrides = { icon: 'IconCustom' };

    const result = removeStandardOverride({
      overrides,
      property: 'labelSingular',
    });

    expect(result).toEqual({ icon: 'IconCustom' });
  });

  it('should remove the specified property', () => {
    const result = removeStandardOverride({
      overrides: {
        labelSingular: 'Custom Label',
        description: 'Custom Description',
      },
      property: 'labelSingular',
    });

    expect(result).toEqual({ description: 'Custom Description' });
  });

  it('should preserve translations when removing top-level property', () => {
    const result = removeStandardOverride({
      overrides: {
        labelSingular: 'Custom Label',
        translations: {
          'fr-FR': { labelSingular: 'French Label' },
        },
      },
      property: 'labelSingular',
    });

    expect(result).toEqual({
      translations: {
        'fr-FR': { labelSingular: 'French Label' },
      },
    });
  });

  it('should remove icon property', () => {
    const result = removeStandardOverride({
      overrides: {
        icon: 'IconCustom',
        labelSingular: 'Custom Label',
      },
      property: 'icon',
    });

    expect(result).toEqual({ labelSingular: 'Custom Label' });
  });
});

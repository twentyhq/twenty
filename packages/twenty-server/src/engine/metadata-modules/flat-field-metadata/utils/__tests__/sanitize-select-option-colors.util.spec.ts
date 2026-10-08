import { sanitizeSelectOptionColors } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-select-option-colors.util';

const OPTION_WITHOUT_COLOR = {
  id: '2c73ce21-d19f-4b37-935e-48c351e2bb1b',
  label: 'Car Repairs and Servicing',
  value: 'CAR_REPAIRS_AND_SERVICING',
  position: 0,
};

describe('sanitizeSelectOptionColors', () => {
  it('defaults a missing color to gray', () => {
    expect(sanitizeSelectOptionColors([OPTION_WITHOUT_COLOR])).toEqual([
      { ...OPTION_WITHOUT_COLOR, color: 'gray' },
    ]);
  });

  it('defaults a null color to gray', () => {
    expect(
      sanitizeSelectOptionColors([{ ...OPTION_WITHOUT_COLOR, color: null }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'gray' }]);
  });

  it('keeps a provided color', () => {
    expect(
      sanitizeSelectOptionColors([{ ...OPTION_WITHOUT_COLOR, color: 'blue' }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'blue' }]);
  });

  it('trims a provided color', () => {
    expect(
      sanitizeSelectOptionColors([
        { ...OPTION_WITHOUT_COLOR, color: '  blue  ' },
      ]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'blue' }]);
  });

  it('leaves an unsupported color for validation to reject', () => {
    expect(
      sanitizeSelectOptionColors([{ ...OPTION_WITHOUT_COLOR, color: 'grey' }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'grey' }]);
  });
});

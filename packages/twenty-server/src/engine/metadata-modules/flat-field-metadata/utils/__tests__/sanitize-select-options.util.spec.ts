import { sanitizeSelectOptions } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-select-options.util';

const OPTION_WITHOUT_COLOR = {
  id: '2c73ce21-d19f-4b37-935e-48c351e2bb1b',
  label: 'Car Repairs and Servicing',
  value: 'CAR_REPAIRS_AND_SERVICING',
  position: 0,
};

describe('sanitizeSelectOptions', () => {
  it('defaults a missing color to gray', () => {
    expect(sanitizeSelectOptions([OPTION_WITHOUT_COLOR])).toEqual([
      { ...OPTION_WITHOUT_COLOR, color: 'gray' },
    ]);
  });

  it('defaults a null color to gray', () => {
    expect(
      sanitizeSelectOptions([{ ...OPTION_WITHOUT_COLOR, color: null }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'gray' }]);
  });

  it('keeps a provided color', () => {
    expect(
      sanitizeSelectOptions([{ ...OPTION_WITHOUT_COLOR, color: 'blue' }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'blue' }]);
  });

  it('trims a provided color', () => {
    expect(
      sanitizeSelectOptions([{ ...OPTION_WITHOUT_COLOR, color: '  blue  ' }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'blue' }]);
  });

  it('trims a provided description', () => {
    expect(
      sanitizeSelectOptions([
        { ...OPTION_WITHOUT_COLOR, description: '  Waiting for a signature ' },
      ]),
    ).toEqual([
      {
        ...OPTION_WITHOUT_COLOR,
        color: 'gray',
        description: 'Waiting for a signature',
      },
    ]);
  });

  it('turns a blank description into null', () => {
    expect(
      sanitizeSelectOptions([{ ...OPTION_WITHOUT_COLOR, description: '   ' }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'gray', description: null }]);
  });

  it('leaves an unsupported color for validation to reject', () => {
    expect(
      sanitizeSelectOptions([{ ...OPTION_WITHOUT_COLOR, color: 'grey' }]),
    ).toEqual([{ ...OPTION_WITHOUT_COLOR, color: 'grey' }]);
  });
});

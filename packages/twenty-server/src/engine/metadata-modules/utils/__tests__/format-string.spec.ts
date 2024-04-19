import {
  formatString,
  validPattern,
} from 'src/engine/metadata-modules/utils/format-string.util';

describe('formatString', () => {
  it('format strings starting with digits', () => {
    const input = '123string';
    const expected = 'string123';

    expect(formatString(input).match(validPattern)?.length).toBe(1);
    expect(formatString(input)).toEqual(expected);

    const inputCapitalized = '123String';
    const expectedCamelCased = 'string123';

    expect(formatString(inputCapitalized).match(validPattern)?.length).toBe(1);
    expect(formatString(inputCapitalized)).toEqual(expectedCamelCased);
  });

  it('format strings with non latin characters', () => {
    const input = 'בְרִבְרִ';
    const expected = 'bRibRiTransliterated';

    expect(formatString(input).match(validPattern)?.length).toBe(1);
    expect(formatString(input)).toEqual(expected);
  });

  it('format strings with mixed characters', () => {
    const input = '2aaבְרִבְרִ';
    const expected = 'aabRibRi2Transliterated';

    expect(formatString(input).match(validPattern)?.length).toBe(1);
    expect(formatString(input)).toEqual(expected);
  });
});

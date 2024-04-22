import { ChararactersNotSupportedException } from 'src/engine/metadata-modules/errors/CharactersNotSupportedException';
import {
  formatString,
  validPattern,
} from 'src/engine/metadata-modules/utils/format-string.util';

describe('formatString', () => {
  it('leaves strings unchanged if only latin characters', () => {
    const input = 'testName';

    expect(formatString(input).match(validPattern)?.length).toBe(1);
    expect(formatString(input)).toEqual(input);
  });

  it('leaves strings unchanged if only latin characters and digits', () => {
    const input = 'testName123';

    expect(formatString(input).match(validPattern)?.length).toBe(1);
    expect(formatString(input)).toEqual(input);
  });

  it('format strings with non latin characters', () => {
    const input = 'בְרִבְרִ';
    const expected = 'bRibRi';

    expect(formatString(input).match(validPattern)?.length).toBe(1);
    expect(formatString(input)).toEqual(expected);
  });

  it('format strings with mixed characters', () => {
    const input = 'aa2בְרִבְרִ';
    const expected = 'aa2BRibRi';

    expect(formatString(input).match(validPattern)?.length).toBe(1);
    expect(formatString(input)).toEqual(expected);
  });

  it('throws error if starts with digits', () => {
    const input = '123string';

    try {
      formatString(input);
    } catch (error: any) {
      expect(error.name).toBe(ChararactersNotSupportedException.name);

      return;
    }
    throw new Error('formatString should have thrown');
  });
});

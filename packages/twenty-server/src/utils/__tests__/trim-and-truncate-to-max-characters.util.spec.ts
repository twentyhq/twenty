import { trimAndTruncateToMaxCharacters } from 'src/utils/trim-and-truncate-to-max-characters.util';

describe('trimAndTruncateToMaxCharacters', () => {
  it('should keep a value within the limit unchanged', () => {
    expect(
      trimAndTruncateToMaxCharacters({ value: 'Jane', maxCharacters: 4 }),
    ).toBe('Jane');
  });

  it('should trim before truncating', () => {
    expect(
      trimAndTruncateToMaxCharacters({ value: '   Jane   ', maxCharacters: 4 }),
    ).toBe('Jane');
  });

  it('should cut a value over the limit', () => {
    expect(
      trimAndTruncateToMaxCharacters({ value: 'Janet', maxCharacters: 4 }),
    ).toBe('Jane');
  });

  it('should count characters rather than UTF-16 code units', () => {
    expect(
      trimAndTruncateToMaxCharacters({ value: '😀😀😀', maxCharacters: 2 }),
    ).toBe('😀😀');
  });

  it('should return an empty string for a blank value', () => {
    expect(
      trimAndTruncateToMaxCharacters({ value: '   ', maxCharacters: 4 }),
    ).toBe('');
  });
});

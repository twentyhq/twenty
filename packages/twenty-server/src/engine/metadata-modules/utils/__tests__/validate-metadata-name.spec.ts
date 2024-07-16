import {
  validateMetadataNameOrThrow,
  InvalidStringException,
  NameTooLongException,
} from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

describe('validateMetadataNameOrThrow', () => {
  it('does not throw if string is valid', () => {
    const input = 'testName';

    expect(validateMetadataNameOrThrow(input)).not.toThrow;
  });
  it('throws error if string has spaces', () => {
    const input = 'name with spaces';

    expect(() => validateMetadataNameOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });
  it('throws error if string starts with capital letter', () => {
    const input = 'StringStartingWithCapitalLetter';

    expect(() => validateMetadataNameOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });

  it('throws error if string has non latin characters', () => {
    const input = 'בְרִבְרִ';

    expect(() => validateMetadataNameOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });

  it('throws error if starts with digits', () => {
    const input = '123string';

    expect(() => validateMetadataNameOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });
  it('does not throw if string is less than 63 characters', () => {
    const inputWith63Characters =
      'thisIsAstringWithSixtyThreeCharacters11111111111111111111111111';

    expect(validateMetadataNameOrThrow(inputWith63Characters)).not.toThrow;
  });
  it('throws error if string is above 63 characters', () => {
    const inputWith64Characters =
      'thisIsAstringWithSixtyFourCharacters1111111111111111111111111111';

    expect(() => validateMetadataNameOrThrow(inputWith64Characters)).toThrow(
      NameTooLongException,
    );
  });
});

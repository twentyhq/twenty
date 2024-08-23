import { InvalidStringException } from 'src/engine/metadata-modules/utils/exceptions/invalid-string.exception';
import { NameTooLongException } from 'src/engine/metadata-modules/utils/exceptions/name-too-long.exception';
import { validateMetadataNameValidityOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-validity.utils';

describe('validateMetadataNameValidityOrThrow', () => {
  it('does not throw if string is valid', () => {
    const input = 'testName';

    expect(validateMetadataNameValidityOrThrow(input)).not.toThrow;
  });
  it('throws error if string has spaces', () => {
    const input = 'name with spaces';

    expect(() => validateMetadataNameValidityOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });
  it('throws error if string starts with capital letter', () => {
    const input = 'StringStartingWithCapitalLetter';

    expect(() => validateMetadataNameValidityOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });

  it('throws error if string has non latin characters', () => {
    const input = 'בְרִבְרִ';

    expect(() => validateMetadataNameValidityOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });

  it('throws error if starts with digits', () => {
    const input = '123string';

    expect(() => validateMetadataNameValidityOrThrow(input)).toThrow(
      InvalidStringException,
    );
  });
  it('does not throw if string is less than 63 characters', () => {
    const inputWith63Characters =
      'thisIsAstringWithSixtyThreeCharacters11111111111111111111111111';

    expect(validateMetadataNameValidityOrThrow(inputWith63Characters)).not
      .toThrow;
  });
  it('throws error if string is above 63 characters', () => {
    const inputWith64Characters =
      'thisIsAstringWithSixtyFourCharacters1111111111111111111111111111';

    expect(() =>
      validateMetadataNameValidityOrThrow(inputWith64Characters),
    ).toThrow(NameTooLongException);
  });
});

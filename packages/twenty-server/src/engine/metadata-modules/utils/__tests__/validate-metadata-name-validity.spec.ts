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
  it('does not throw if string is less than 62 characters', () => {
    const inputWith62Characters =
      'thisIsAstringWithSixtyTwoCharactersiiiiiiiiiiiiiiiiiiiiiiiiiii';

    expect(validateMetadataNameValidityOrThrow(inputWith62Characters)).not
      .toThrow;
  });
  it('throws error if string is 62 characters long with a prefix of length 1', () => {
    const inputWith62Characters =
      'thisIsAstringWithSixtyTwoCharactersiiiiiiiiiiiiiiiiiiiiiiiiiii';

    expect(() =>
      validateMetadataNameValidityOrThrow(inputWith62Characters, 1),
    ).toThrow(NameTooLongException);
  });
  it('does not throw error if string is 61 characters long with a prefix of length 1', () => {
    const inputWith61Characters =
      'thisIsAstringWithSixtyOneCharactersiiiiiiiiiiiiiiiiiiiiiiiiii';

    expect(validateMetadataNameValidityOrThrow(inputWith61Characters, 1)).not
      .toThrow;
  });
  it('throws error if string is above 62 characters', () => {
    const inputWith63Characters =
      'thisIsAstringWithSixtyThreeCharactersiiiiiiiiiiiiiiiiiiiiiiiiii';

    expect(() =>
      validateMetadataNameValidityOrThrow(inputWith63Characters),
    ).toThrow(NameTooLongException);
  });
});

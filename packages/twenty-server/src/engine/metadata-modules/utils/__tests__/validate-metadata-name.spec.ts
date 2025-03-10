import { EachTestingContext } from 'twenty-shared';

import { InvalidStringException } from 'src/engine/metadata-modules/utils/exceptions/invalid-string.exception';
import { NameIsReservedKeywordException } from 'src/engine/metadata-modules/utils/exceptions/name-is-reserved-keyword.exception';
import { NameTooLongException } from 'src/engine/metadata-modules/utils/exceptions/name-too-long.exception';
import { NameTooShortException } from 'src/engine/metadata-modules/utils/exceptions/name-too-short.exception';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

type ValidateMetadataNameTestContext = EachTestingContext<{
  input: string;
  expectedError?: typeof InvalidStringException | typeof NameTooLongException;
}>;

const validateMetadataNameTestCases: ValidateMetadataNameTestContext[] = [
  {
    title: 'validates when string is valid',
    context: {
      input: 'testName',
    },
  },
  {
    title: 'throws error when string has spaces',
    context: {
      input: 'name with spaces',
      expectedError: InvalidStringException,
    },
  },
  {
    title: 'throws error when string is a reserved word',
    context: {
      input: 'role',
      expectedError: NameIsReservedKeywordException,
    },
  },
  {
    title: 'throws error when string starts with capital letter',
    context: {
      input: 'StringStartingWithCapitalLetter',
      expectedError: InvalidStringException,
    },
  },
  {
    title: 'throws error when string has non latin characters',
    context: {
      input: 'בְרִבְרִ',
      expectedError: InvalidStringException,
    },
  },
  {
    title: 'throws error when starts with digits',
    context: {
      input: '123string',
      expectedError: InvalidStringException,
    },
  },
  {
    title: 'validates when string is less than 63 characters',
    context: {
      input: 'thisIsAstringWithSixtyThreeCharacters11111111111111111111111111',
    },
  },
  {
    title: 'throws error when string is above 63 characters',
    context: {
      input: 'thisIsAstringWithSixtyFourCharacters1111111111111111111111111111',
      expectedError: NameTooLongException,
    },
  },
  {
    title: 'throws error when string is empty',
    context: {
      input: '',
      expectedError: NameTooShortException,
    },
  },
];

describe('validateMetadataNameOrThrow', () => {
  it.each(validateMetadataNameTestCases)('$title', ({ context }) => {
    if (context.expectedError) {
      expect(() => validateMetadataNameOrThrow(context.input)).toThrow(
        context.expectedError,
      );
    } else {
      expect(() => validateMetadataNameOrThrow(context.input)).not.toThrow();
    }
  });
});

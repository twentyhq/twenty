import { EachTestingContext } from 'twenty-shared';

import { InvalidStringException } from 'src/engine/metadata-modules/utils/exceptions/invalid-string.exception';
import { NameIsReservedKeywordException } from 'src/engine/metadata-modules/utils/exceptions/name-is-reserved-keyword.exception';
import { NameIsNotInCamelCase } from 'src/engine/metadata-modules/utils/exceptions/name-not-camel-case.exception';
import { NameTooLongException } from 'src/engine/metadata-modules/utils/exceptions/name-too-long.exception';
import { NameTooShortException } from 'src/engine/metadata-modules/utils/exceptions/name-too-short.exception';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

type ValidateMetadataNameTestContext = EachTestingContext<{
  input: string;
  expectedError?: any;
}>;

const validateMetadataNameTestCases: ValidateMetadataNameTestContext[] = [
  {
    title: 'validates when string is valid',
    context: {
      input: 'testName',
    },
  },
  {
    title: 'throw error when string is not in camel case',
    context: {
      input: 'TestName',
      expectedError: NameIsNotInCamelCase,
    },
  },
  {
    title: 'throws error when string has spaces',
    context: {
      input: 'name with spaces',
      expectedError: NameIsNotInCamelCase,
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
      expectedError: NameIsNotInCamelCase,
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
      expectedError: NameIsNotInCamelCase,
    },
  },
  {
    title: 'validates when string is less than 63 characters',
    context: {
      input: 'a'.repeat(63),
    },
  },
  {
    title: 'throws error when string is above 63 characters',
    context: {
      input: 'a'.repeat(64),
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

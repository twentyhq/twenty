import { EachTestingContext } from 'twenty-shared/testing';

import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

type ValidateMetadataNameTestContext = EachTestingContext<{
  input: string;
  shouldNotThrow?: true;
}>;

const validateMetadataNameTestCases: ValidateMetadataNameTestContext[] = [
  {
    title: 'validates when string is valid',
    context: {
      input: 'testName',
      shouldNotThrow: true,
    },
  },
  {
    title: 'throw error when string is not in camel case',
    context: {
      input: 'TestName',
    },
  },
  {
    title: 'throws error when string has spaces',
    context: {
      input: 'name with spaces',
    },
  },
  {
    title: 'throws error when string is a reserved word',
    context: {
      input: 'role',
    },
  },
  {
    title: 'throws error when string starts with capital letter',
    context: {
      input: 'StringStartingWithCapitalLetter',
    },
  },
  {
    title: 'throws error when string has non latin characters',
    context: {
      input: 'בְרִבְרִ',
    },
  },
  {
    title: 'throws error when starts with digits',
    context: {
      input: '123string',
    },
  },
  {
    title: 'validates when string is less than 63 characters',
    context: {
      input: 'a'.repeat(63),
      shouldNotThrow: true,
    },
  },
  {
    title: 'throws error when string is above 63 characters',
    context: {
      input: 'a'.repeat(64),
    },
  },
  {
    title: 'throws error when string is empty',
    context: {
      input: '',
    },
  },
];

describe('validateMetadataNameOrThrow', () => {
  it.each(validateMetadataNameTestCases)(
    '$title',
    ({ context: { input, shouldNotThrow } }) => {
      if (shouldNotThrow) {
        expect(() => validateMetadataNameOrThrow(input)).not.toThrow();
      } else {
        expect(() =>
          validateMetadataNameOrThrow(input),
        ).toThrowErrorMatchingSnapshot();
      }
    },
  );
});

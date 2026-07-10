import { type EachTestingContext } from 'twenty-shared/testing';

import { type FailingObjectMetadataCreationTestCase } from 'test/integration/metadata/suites/object-metadata/common/failing-object-metadata-creation-test-case.type';

const INVALID_NAME_MESSAGE =
  'Name is not valid: it must start with lowercase letter and contain only alphanumeric letters';
const RESERVED_NAME_MESSAGE =
  'This name is reserved. Use a different name or the system will add "Custom" suffix.';
const IDENTICAL_NAMES_MESSAGE =
  'The singular and plural names cannot be the same for an object';

export const OBJECT_METADATA_NAMES_FAILING_TEST_CASES: EachTestingContext<FailingObjectMetadataCreationTestCase>[] =
  [
    {
      title: 'when nameSingular has invalid characters',
      context: {
        input: { nameSingular: 'μ' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [INVALID_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when namePlural has invalid characters',
      context: {
        input: { namePlural: 'μ' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [INVALID_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when nameSingular is a reserved keyword',
      context: {
        input: { nameSingular: 'user' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [RESERVED_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when namePlural is a reserved keyword',
      context: {
        input: { namePlural: 'users' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [RESERVED_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when nameSingular is not camelCased',
      context: {
        input: { nameSingular: 'Not_Camel_Case' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [INVALID_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when namePlural is not camelCased',
      context: {
        input: { namePlural: 'Not_Camel_Case' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [INVALID_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when namePlural is an empty string',
      context: {
        input: { namePlural: '' },
        expected: {
          errorCode: 'BAD_USER_INPUT',
          messageContains: 'namePlural should not be empty',
        },
      },
    },
    {
      title: 'when nameSingular is an empty string',
      context: {
        input: { nameSingular: '' },
        expected: {
          errorCode: 'BAD_USER_INPUT',
          messageContains: 'nameSingular should not be empty',
        },
      },
    },
    {
      title: 'when nameSingular contains only whitespaces',
      context: {
        input: { nameSingular: '                 ' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: ['Name is too short', INVALID_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when nameSingular contains only one char and whitespaces',
      context: {
        input: { nameSingular: '     a        a    ' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [INVALID_NAME_MESSAGE],
        },
      },
    },
    {
      title: 'when name exceeds maximum length',
      context: {
        input: { nameSingular: 'a'.repeat(64) },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: ['Name is too long'],
        },
      },
    },
    {
      title: 'when names are identical',
      context: {
        input: {
          nameSingular: 'fooBar',
          namePlural: 'fooBar',
        },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [IDENTICAL_NAMES_MESSAGE],
        },
      },
    },
    {
      title: 'when names with whitespaces result to be identical',
      context: {
        input: {
          nameSingular: '      fooBar               ',
          namePlural: 'fooBar',
        },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [IDENTICAL_NAMES_MESSAGE],
        },
      },
    },
  ];

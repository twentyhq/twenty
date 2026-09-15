import { type EachTestingContext } from 'twenty-shared/testing';

import { type FailingObjectMetadataCreationTestCase } from 'test/integration/metadata/suites/object-metadata/common/failing-object-metadata-creation-test-case.type';

const LABEL_TOO_LONG_MESSAGE = 'Object label is too long';
const LABEL_TOO_SHORT_MESSAGE = 'Object label is too short';

export const OBJECT_METADATA_LABEL_FAILING_TEST_CASES: EachTestingContext<FailingObjectMetadataCreationTestCase>[] =
  [
    {
      title: 'when labelSingular is empty',
      context: {
        input: { labelSingular: '' },
        expected: {
          errorCode: 'BAD_USER_INPUT',
          messageContains: 'labelSingular should not be empty',
        },
      },
    },
    {
      title: 'when labelPlural is empty',
      context: {
        input: { labelPlural: '' },
        expected: {
          errorCode: 'BAD_USER_INPUT',
          messageContains: 'labelPlural should not be empty',
        },
      },
    },
    {
      title: 'when labelSingular exceeds maximum length',
      context: {
        input: { labelSingular: 'A'.repeat(64) },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [LABEL_TOO_LONG_MESSAGE],
        },
      },
    },
    {
      title: 'when labelPlural exceeds maximum length',
      context: {
        input: { labelPlural: 'A'.repeat(64) },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [LABEL_TOO_LONG_MESSAGE],
        },
      },
    },
    {
      title: 'when labelSingular contains only whitespace',
      context: {
        input: { labelSingular: '   ' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [LABEL_TOO_SHORT_MESSAGE],
        },
      },
    },
    {
      title: 'when labelPlural contains only whitespace',
      context: {
        input: { labelPlural: '   ' },
        expected: {
          errorCode: 'METADATA_VALIDATION_FAILED',
          objectValidationMessages: [LABEL_TOO_SHORT_MESSAGE],
        },
      },
    },
  ];

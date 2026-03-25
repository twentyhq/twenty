import { type EachTestingContext } from 'twenty-shared/testing';

import { computeMetadataNameFromLabelOrThrow } from 'src/engine/metadata-modules/utils/compute-metadata-name-from-label-or-throw.util';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

type ComputeMetadataNameFromLabelTestCase = EachTestingContext<{
  input: string;
  expected?: string;
  expectToThrow?: {
    error: InvalidMetadataException;
  };
}>;

describe('computeMetadataNameFromLabel', () => {
  const successfulTestCases: ComputeMetadataNameFromLabelTestCase[] = [
    {
      title: 'should convert a simple label to camelCase',
      context: {
        input: 'Simple Label',
        expected: 'simpleLabel',
      },
    },
    {
      title: 'should handle special characters and convert to camelCase',
      context: {
        input: 'Special & Characters!',
        expected: 'specialCharacters',
      },
    },
    {
      title: 'should prefix numeric labels with n',
      context: {
        input: '123 Test',
        expected: 'n123Test',
      },
    },
    {
      title: 'should handle multiple spaces and convert to camelCase',
      context: {
        input: 'Multiple   Spaces   Here',
        expected: 'multipleSpacesHere',
      },
    },
    {
      title: 'should handle accented characters',
      context: {
        input: 'Café Crème',
        expected: 'cafeCreme',
      },
    },
    {
      title: 'should handle empty label',
      context: {
        input: '',
        expected: '',
      },
    },
    {
      title: 'should handle mixed case input',
      context: {
        input: 'MiXeD cAsE',
        expected: 'mixedCase',
      },
    },
    {
      title: 'should add "Custom" suffix to reserved keywords',
      context: {
        input: 'Plan',
        expected: 'planCustom',
      },
    },
    {
      title: 'should add "Custom" suffix to plural reserved keywords',
      context: {
        input: 'Events',
        expected: 'eventsCustom',
      },
    },
    {
      title: 'should add "Custom" suffix to core object names',
      context: {
        input: 'User',
        expected: 'userCustom',
      },
    },
    {
      title: 'should not modify non-reserved keywords',
      context: {
        input: 'Customer',
        expected: 'customer',
      },
    },
  ];

  const failingTestCases: ComputeMetadataNameFromLabelTestCase[] = [
    {
      title: 'should throw when label is undefined',
      context: {
        input: undefined as unknown as string,
        expectToThrow: {
          error: new InvalidMetadataException(
            'Label is required',
            InvalidMetadataExceptionCode.LABEL_REQUIRED,
          ),
        },
      },
    },
    {
      title: 'should throw when label contains only special characters',
      context: {
        input: '!@#$%^&*()',
        expectToThrow: {
          error: new InvalidMetadataException(
            'Invalid label: "!@#$%^&*()"',
            InvalidMetadataExceptionCode.INVALID_LABEL,
          ),
        },
      },
    },
  ];

  describe('successful cases', () => {
    it.each(successfulTestCases)('$title', ({ context }) => {
      const result = computeMetadataNameFromLabelOrThrow(context.input);

      expect(result).toBe(context.expected);
    });
  });

  describe('failing cases', () => {
    it.each(failingTestCases)('$title', ({ context }) => {
      expect(() => computeMetadataNameFromLabelOrThrow(context.input)).toThrow(
        context.expectToThrow?.error,
      );
    });
  });
});

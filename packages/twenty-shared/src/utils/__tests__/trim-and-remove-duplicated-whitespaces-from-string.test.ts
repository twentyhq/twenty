import { type EachTestingContext } from '@/testing/types/EachTestingContext.type';
import { trimAndRemoveDuplicatedWhitespacesFromString } from '../trim-and-remove-duplicated-whitespaces-from-string';

type TrimAndRemoveWhitespacesTestCase = EachTestingContext<{
  input: string;
  expected: string;
}>;

describe('trim-and-remove-duplicated-whitespaces-from-string', () => {
  const testCases: TrimAndRemoveWhitespacesTestCase[] = [
    {
      title: 'should trim and remove duplicated whitespaces from a string',
      context: {
        input: '  Hello   World  ',
        expected: 'Hello World',
      },
    },
    {
      title: 'should handle string with multiple spaces between words',
      context: {
        input: 'This   is   a   test',
        expected: 'This is a test',
      },
    },
    {
      title: 'should handle string with only whitespaces',
      context: {
        input: '     ',
        expected: '',
      },
    },
    {
      title: 'should handle empty string',
      context: {
        input: '',
        expected: '',
      },
    },
    {
      title: 'should handle string with tabs and newlines',
      context: {
        input: 'Hello\t\t\tWorld\n\n  Test',
        expected: 'Hello World Test',
      },
    },
    {
      title: 'should handle string with leading and trailing spaces',
      context: {
        input: '   Leading and trailing spaces   ',
        expected: 'Leading and trailing spaces',
      },
    },
    {
      title: 'should preserve single spaces between words',
      context: {
        input: 'This is already properly spaced',
        expected: 'This is already properly spaced',
      },
    },
  ];

  test.each(testCases)('$title', ({ context: { input, expected } }) => {
    const result = trimAndRemoveDuplicatedWhitespacesFromString(input);

    expect(result).toEqual(expected);
  });
});

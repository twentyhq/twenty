import { EachTestingContext } from '@/testing/types/EachTestingContext.type';
import { fromArrayToUniqueKeyRecord } from '@/utils/from-array-to-unique-key-record.util';

type FromArrayToUniqueKeyRecordTestCase = EachTestingContext<{
  input: {
    array: any[];
    uniqueKey: string;
  };
  expected: Record<string, any> | Error;
}>;

describe('fromArrayToUniqueKeyRecord', () => {
  const testCases: FromArrayToUniqueKeyRecordTestCase[] = [
    {
      title: 'should convert array to record using id as unique key',
      context: {
        input: {
          array: [
            { id: '1', name: 'John' },
            { id: '2', name: 'Jane' },
          ],
          uniqueKey: 'id',
        },
        expected: {
          '1': { id: '1', name: 'John' },
          '2': { id: '2', name: 'Jane' },
        },
      },
    },
    {
      title: 'should convert array to record using email as unique key',
      context: {
        input: {
          array: [
            { email: 'john@test.com', name: 'John' },
            { email: 'jane@test.com', name: 'Jane' },
          ],
          uniqueKey: 'email',
        },
        expected: {
          'john@test.com': { email: 'john@test.com', name: 'John' },
          'jane@test.com': { email: 'jane@test.com', name: 'Jane' },
        },
      },
    },
    {
      title: 'should handle empty array',
      context: {
        input: {
          array: [],
          uniqueKey: 'id',
        },
        expected: {},
      },
    },
    {
      title: 'should throw error when array contains duplicate unique keys',
      context: {
        input: {
          array: [
            { id: '1', name: 'John' },
            { id: '1', name: 'Jane' },
          ],
          uniqueKey: 'id',
        },
        expected: new Error(
          'Should never occur, flat array contains twice the same unique key 1',
        ),
      },
    },
  ];

  test.each(testCases)('$title', ({ context: { input, expected } }) => {
    if (expected instanceof Error) {
      expect(() =>
        fromArrayToUniqueKeyRecord({
          array: input.array,
          uniqueKey: input.uniqueKey,
        }),
      ).toThrow(expected.message);
    } else {
      const result = fromArrayToUniqueKeyRecord({
        array: input.array,
        uniqueKey: input.uniqueKey,
      });

      expect(result).toEqual(expected);
    }
  });
});

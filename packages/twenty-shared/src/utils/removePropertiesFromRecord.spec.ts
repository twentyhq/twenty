import { removePropertiesFromRecord } from './removePropertiesFromRecord';

type TestCase<T extends Record<string, unknown>> = {
  name: string;
  input: {
    record: T;
    keysToRemove: (keyof T)[];
  };
  expected: Partial<T>;
  originalRecord?: T;
};

describe('removePropertiesFromRecord', () => {
  test.each<TestCase<Record<string, unknown>>>([
    {
      name: 'should remove specified properties from a record',
      input: {
        record: {
          id: '1',
          name: 'John',
          email: 'john@example.com',
          password: 'secret',
        },
        keysToRemove: ['password', 'email'],
      },
      expected: {
        id: '1',
        name: 'John',
      },
    },
    {
      name: 'should handle empty array of keys to remove',
      input: {
        record: {
          id: '1',
          name: 'John',
        },
        keysToRemove: [],
      },
      expected: {
        id: '1',
        name: 'John',
      },
    },
    {
      name: 'should handle record with nested objects',
      input: {
        record: {
          id: '1',
          name: 'John',
          profile: {
            age: 30,
            city: 'New York',
          },
        },
        keysToRemove: ['profile'],
      },
      expected: {
        id: '1',
        name: 'John',
      },
    },
    {
      name: 'should preserve the original record',
      input: {
        record: {
          id: '1',
          name: 'John',
          email: 'john@example.com',
        },
        keysToRemove: ['email'],
      },
      expected: {
        id: '1',
        name: 'John',
      },
      originalRecord: {
        id: '1',
        name: 'John',
        email: 'john@example.com',
      },
    },
  ])('$name', ({ input, expected, originalRecord }) => {
    const result = removePropertiesFromRecord(input.record, input.keysToRemove);

    expect(result).toEqual(expected);

    if (originalRecord) {
      expect(input.record).toEqual(originalRecord);
    }
  });

  // Separate test for TypeScript error case
  it('should handle removing non-existent properties', () => {
    const record = {
      id: '1',
      name: 'John',
    };

    // @ts-expect-error - Testing runtime behavior with non-existent key
    const result = removePropertiesFromRecord(record, ['nonExistent']);

    expect(result).toEqual({
      id: '1',
      name: 'John',
    });
  });
});

import { EachTestingContext } from '@/testing/types/EachTestingContext.type';
import { sanitizeObjectStringFields } from '../sanitizeObjectStringFields';
type TestObject = {
  name?: string;
  age?: number | null;
  city?: string | undefined;
  description?: string;
  user?: {
    name: string;
    contact: {
      email: string;
    };
  };
};

type PrastoinTestCase = EachTestingContext<{
  input: {
    obj: TestObject;
    keys: (keyof TestObject)[];
  };
  expected: object;
}>;

describe('prastoin', () => {
  const testCases: PrastoinTestCase[] = [
    {
      title: 'should handle basic string properties and trim whitespaces',
      context: {
        input: {
          obj: { name: '  John   Doe  ', age: 30 },
          keys: ['name', 'age'],
        },
        expected: { name: 'John Doe', age: 30 },
      },
    },
    {
      title: 'should handle nested objects',
      context: {
        input: {
          obj: {
            user: {
              name: '  Jane   Smith  ',
              contact: { email: '  jane@example.com  ' },
            },
          },
          keys: ['user'],
        },
        expected: {
          user: {
            name: 'Jane Smith',
            contact: { email: 'jane@example.com' },
          },
        },
      },
    },
    {
      title: 'should skip undefined and null values',
      context: {
        input: {
          obj: { name: '  John  ', age: null, city: undefined },
          keys: ['name', 'age', 'city'],
        },
        expected: { name: 'John', age: null },
      },
    },

    {
      title: 'should handle empty object',
      context: {
        input: {
          obj: {},
          keys: ['name', 'age'],
        },
        expected: {},
      },
    },
    {
      title: 'should handle object with no matching keys',
      context: {
        input: {
          obj: { name: 'John', age: 30 },
          keys: ['city', 'name'],
        },
        expected: { name: 'John', age: 30 },
      },
    },
    {
      title: 'should handle string with multiple spaces, tabs and newlines',
      context: {
        input: {
          obj: { description: 'This   is\t\ta\n\ntest    string' },
          keys: ['description'],
        },
        expected: { description: 'This is a test string' },
      },
    },
  ];

  test.each(testCases)(
    '$title',
    ({
      context: {
        input: { obj, keys },
        expected,
      },
    }) => {
      const result = sanitizeObjectStringFields(obj, keys);

      expect(result).toEqual(expected);
    },
  );
});

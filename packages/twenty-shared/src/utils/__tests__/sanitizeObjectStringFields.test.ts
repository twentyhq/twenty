import { eachTestingContextFilter } from '@/testing';
import { type EachTestingContext } from '@/testing/types/EachTestingContext.type';
import { extractAndSanitizeObjectStringFields } from '../extractAndSanitizeObjectStringFields';

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
  tags?: string[];
  items?: Array<{ name: string }>;
  mixedArray?: Array<string | number | null | { text: string }>;
};

type SanitizeTestCase = EachTestingContext<{
  input: {
    obj: TestObject;
    keys: (keyof TestObject)[];
  };
  expected: object;
}>;

describe('extractAndSanitizeObjectStringFields', () => {
  const testCases: SanitizeTestCase[] = [
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
        expected: { name: 'John', age: null, city: undefined },
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
        expected: { name: 'John' },
      },
    },
    {
      title: 'should handle object with number field',
      context: {
        input: {
          obj: { name: 'John', age: 30 },
          keys: ['age', 'name'],
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
    {
      title: 'should handle array of strings within object',
      context: {
        input: {
          obj: { tags: ['  tag1  ', '  tag2  ', 'test   string   '] },
          keys: ['tags'],
        },
        expected: { tags: ['tag1', 'tag2', 'test string'] },
      },
    },
    {
      title: 'should handle array of objects within object',
      context: {
        input: {
          obj: {
            items: [{ name: '  John   Doe  ' }, { name: '  Jane   Smith  ' }],
          },
          keys: ['items'],
        },
        expected: {
          items: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
        },
      },
    },
    {
      title: 'should handle nested arrays within object properties',
      context: {
        input: {
          obj: {
            tags: ['  tag1  ', '  tag2  '],
            user: {
              name: '  John   Doe  ',
              contact: { email: '  john@example.com  ' },
            },
          },
          keys: ['tags', 'user'],
        },
        expected: {
          tags: ['tag1', 'tag2'],
          user: {
            name: 'John Doe',
            contact: { email: 'john@example.com' },
          },
        },
      },
    },
    {
      title: 'should handle mixed content array within object',
      context: {
        input: {
          obj: {
            mixedArray: [
              '  string  ',
              123,
              null,
              { text: '  nested   text  ' },
            ],
          },
          keys: ['mixedArray'],
        },
        expected: {
          mixedArray: ['string', 123, null, { text: 'nested text' }],
        },
      },
    },
  ];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({
      context: {
        input: { obj, keys },
        expected,
      },
    }) => {
      const result = extractAndSanitizeObjectStringFields(obj, keys);

      expect(result).toEqual(expected);
    },
  );
});

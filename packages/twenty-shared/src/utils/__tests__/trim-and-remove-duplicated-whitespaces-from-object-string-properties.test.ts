import { eachTestingContextFilter } from '@/testing';
import { type EachTestingContext } from '@/testing/types/EachTestingContext.type';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from '../trim-and-remove-duplicated-whitespaces-from-object-string-properties';
type SanitizeObjectStringPropertiesTestCase = EachTestingContext<{
  input: Record<string, any>;
  keys: string[];
  expected: Record<string, any>;
  extract?: boolean;
}>;

describe('trim-and-remove-duplicated-whitespaces-from-object-string-properties', () => {
  const testCases: SanitizeObjectStringPropertiesTestCase[] = [
    {
      title: 'should sanitize single string property',
      context: {
        input: { name: '  John   Doe  ' },
        keys: ['name'],
        expected: { name: 'John Doe' },
      },
    },
    {
      title: 'should sanitize multiple string properties',
      context: {
        input: {
          firstName: '  John  ',
          lastName: '  Doe  ',
          email: '  john.doe@example.com  ',
        },
        keys: ['firstName', 'lastName', 'email'],
        expected: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      },
    },
    {
      title: 'should preserve undefined properties',
      context: {
        input: { name: '  John   Doe  ' },
        keys: ['name', 'age'],
        expected: { name: 'John Doe' },
      },
    },
    {
      title: 'should handle null properties',
      context: {
        input: { name: '  John   Doe  ', description: null },
        keys: ['name', 'description'],
        expected: { name: 'John Doe', description: null },
      },
    },
    {
      title: 'should not modify non-string properties',
      context: {
        input: { name: '  John   Doe  ', age: 30, active: true },
        // In real life passing age would raise an TypeScript error
        keys: ['name', 'age', 'active'],
        expected: { name: 'John Doe', age: 30, active: true },
      },
    },
    {
      title: 'should handle empty string',
      context: {
        input: { name: '   ' },
        keys: ['name'],
        expected: { name: '' },
      },
    },
    {
      title: 'should handle object with no properties to sanitize',
      context: {
        input: { age: 30, active: true },
        keys: ['name'],
        expected: { age: 30, active: true },
      },
    },
    {
      title: 'should handle nested whitespace',
      context: {
        input: { description: '  This   is   a   test  ' },
        keys: ['description'],
        expected: { description: 'This is a test' },
      },
    },
    {
      title: 'should trim only provided keys fields',
      context: {
        input: {
          name: '  John   Doe  ',
          description: ' this      is a test   ',
        },
        keys: ['description'],
        expected: { name: '  John   Doe  ', description: 'this is a test' },
      },
    },
    {
      title: 'should trim only provided keys fields and extract keys',
      context: {
        input: {
          name: '  John   Doe  ',
          description: ' this      is a test   ',
        },
        keys: ['description'],
        expected: { description: 'this is a test' },
        extract: true,
      },
    },
  ];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({ context: { input, keys, expected, extract } }) => {
      const result =
        trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
          input,
          keys,
          extract,
        );

      expect(result).toEqual(expected);
    },
  );
});

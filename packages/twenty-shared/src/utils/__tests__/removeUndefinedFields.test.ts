import { removeUndefinedFields } from '../removeUndefinedFields';

interface PrimitiveTestContext {
  description: string;
  input: null | undefined | string | number | boolean;
  expected: null | undefined | string | number | boolean;
}

interface ObjectTestContext {
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
}

describe('removeUndefinedFields', () => {
  describe.each<PrimitiveTestContext>([
    {
      description: 'null',
      input: null,
      expected: null,
    },
    {
      description: 'undefined',
      input: undefined,
      expected: undefined,
    },
    {
      description: 'string',
      input: 'string',
      expected: 'string',
    },
    {
      description: 'number',
      input: 123,
      expected: 123,
    },
    {
      description: 'boolean true',
      input: true,
      expected: true,
    },
    {
      description: 'boolean false',
      input: false,
      expected: false,
    },
  ])('primitive value: $description', ({ input, expected }) => {
    it('should return the value as is', () => {
      expect(removeUndefinedFields(input)).toBe(expected);
    });
  });

  describe.each<ObjectTestContext>([
    {
      description: 'flat object',
      input: {
        name: 'John',
        age: 30,
        email: undefined,
        phone: null,
        address: undefined,
      },
      expected: {
        name: 'John',
        age: 30,
        phone: null,
      },
    },
    {
      description: 'nested object',
      input: {
        name: 'John',
        contact: {
          email: undefined,
          phone: '123456',
          address: {
            street: '123 Main St',
            apt: undefined,
            city: 'New York',
          },
        },
        preferences: undefined,
      },
      expected: {
        name: 'John',
        contact: {
          phone: '123456',
          address: {
            street: '123 Main St',
            city: 'New York',
          },
        },
      },
    },
    {
      description: 'arrays',
      input: {
        names: ['John', undefined, 'Jane', null],
        tags: [
          { id: 1, label: 'active' },
          { id: undefined, label: 'pending' },
          undefined,
          { id: 3, label: undefined },
        ],
      },
      expected: {
        names: ['John', 'Jane', null],
        tags: [{ id: 1, label: 'active' }, { label: 'pending' }, { id: 3 }],
      },
    },
    {
      description: 'empty objects after cleaning',
      input: {
        name: 'John',
        metadata: {
          tags: undefined,
          flags: undefined,
        },
        settings: {},
      },
      expected: {
        name: 'John',
      },
    },
  ])('object case: $description', ({ input, expected }) => {
    it('should clean undefined fields correctly', () => {
      expect(removeUndefinedFields(input)).toEqual(expected);
    });
  });
});

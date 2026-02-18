import { getOutputSchemaFromValue } from '@/logic-function/get-output-schema-from-value';

describe('getOutputSchemaFromValue', () => {
  it('should compute outputSchema properly for mixed types', () => {
    const testResult = {
      a: null,
      b: 'b',
      c: { cc: 1 },
      d: true,
      e: [1, 2, 3],
    };
    const expectedOutputSchema = {
      a: {
        isLeaf: true,
        type: 'unknown',
        value: null,
        label: 'a',
      },
      b: {
        isLeaf: true,
        type: 'string',
        value: 'b',
        label: 'b',
      },
      c: {
        isLeaf: false,
        type: 'object',
        label: 'c',
        value: {
          cc: {
            isLeaf: true,
            type: 'number',
            value: 1,
            label: 'cc',
          },
        },
      },
      d: {
        isLeaf: true,
        type: 'boolean',
        value: true,
        label: 'd',
      },
      e: {
        isLeaf: true,
        type: 'array',
        value: [1, 2, 3],
        label: 'e',
      },
    };
    expect(getOutputSchemaFromValue(testResult)).toEqual(expectedOutputSchema);
  });

  it('should handle nested objects', () => {
    const testResult = {
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      },
    };

    const result = getOutputSchemaFromValue(testResult);

    expect(result.user).toEqual({
      isLeaf: false,
      type: 'object',
      label: 'user',
      value: {
        name: {
          isLeaf: true,
          type: 'string',
          value: 'John',
          label: 'name',
        },
        address: {
          isLeaf: false,
          type: 'object',
          label: 'address',
          value: {
            street: {
              isLeaf: true,
              type: 'string',
              value: '123 Main St',
              label: 'street',
            },
            city: {
              isLeaf: true,
              type: 'string',
              value: 'New York',
              label: 'city',
            },
          },
        },
      },
    });
  });

  it('should return empty object for empty input', () => {
    expect(getOutputSchemaFromValue({})).toEqual({});
  });
});

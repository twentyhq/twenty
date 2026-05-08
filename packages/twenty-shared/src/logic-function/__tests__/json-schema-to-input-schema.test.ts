import { jsonSchemaToInputSchema } from '@/logic-function/json-schema-to-input-schema';

describe('jsonSchemaToInputSchema', () => {
  it('wraps a JSON Schema object into a single-element InputSchema array', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: {
        name: { type: 'string', description: 'A name' },
        age: { type: 'number' },
      },
      required: ['name'],
    });

    expect(result).toEqual([
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      },
    ]);
  });

  it('maps integer to number', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: { count: { type: 'integer' } },
    });

    expect(result[0].properties).toEqual({ count: { type: 'number' } });
  });

  it('maps null to unknown', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: { value: { type: 'null' } },
    });

    expect(result[0].properties).toEqual({ value: { type: 'unknown' } });
  });

  it('preserves array items', () => {
    const result = jsonSchemaToInputSchema({
      type: 'array',
      items: { type: 'string' },
    });

    expect(result).toEqual([
      {
        type: 'array',
        items: { type: 'string' },
      },
    ]);
  });

  it('preserves enum on string properties', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: {
        color: { type: 'string', enum: ['red', 'green', 'blue'] },
      },
    });

    expect(result[0].properties?.color).toEqual({
      type: 'string',
      enum: ['red', 'green', 'blue'],
    });
  });

  it('drops non-string enum values silently', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: {
        mixed: { type: 'string', enum: ['a', 1, true, 'b'] },
      },
    });

    expect(result[0].properties?.mixed).toEqual({
      type: 'string',
      enum: ['a', 'b'],
    });
  });
});

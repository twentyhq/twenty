import { inputSchemaToOutputSchema } from '@/logic-function/input-schema-to-output-schema';

describe('inputSchemaToOutputSchema', () => {
  it('should convert a flat object schema to a BaseOutputSchemaV2', () => {
    const inputSchema = [
      {
        type: 'object' as const,
        properties: {
          success: { type: 'boolean' as const },
          message: { type: 'string' as const },
          error: { type: 'string' as const },
          messageId: { type: 'string' as const },
          channelId: { type: 'string' as const },
        },
      },
    ];

    expect(inputSchemaToOutputSchema(inputSchema)).toEqual({
      success: { isLeaf: true, type: 'boolean', label: 'success', value: null },
      message: { isLeaf: true, type: 'string', label: 'message', value: null },
      error: { isLeaf: true, type: 'string', label: 'error', value: null },
      messageId: {
        isLeaf: true,
        type: 'string',
        label: 'messageId',
        value: null,
      },
      channelId: {
        isLeaf: true,
        type: 'string',
        label: 'channelId',
        value: null,
      },
    });
  });

  it('should convert nested object properties into Node entries', () => {
    const inputSchema = [
      {
        type: 'object' as const,
        properties: {
          user: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const },
              age: { type: 'number' as const },
            },
          },
        },
      },
    ];

    expect(inputSchemaToOutputSchema(inputSchema)).toEqual({
      user: {
        isLeaf: false,
        type: 'object',
        label: 'user',
        value: {
          name: { isLeaf: true, type: 'string', label: 'name', value: null },
          age: { isLeaf: true, type: 'number', label: 'age', value: null },
        },
      },
    });
  });

  it('should treat arrays as leaves with type "array"', () => {
    const inputSchema = [
      {
        type: 'object' as const,
        properties: {
          tags: {
            type: 'array' as const,
            items: { type: 'string' as const },
          },
        },
      },
    ];

    expect(inputSchemaToOutputSchema(inputSchema)).toEqual({
      tags: { isLeaf: true, type: 'array', label: 'tags', value: null },
    });
  });

  it('should map non-leaf, non-object property types to "unknown"', () => {
    const inputSchema = [
      {
        type: 'object' as const,
        properties: {
          richText: { type: 'RICH_TEXT' as const as 'string' },
        },
      },
    ];

    expect(inputSchemaToOutputSchema(inputSchema)).toEqual({
      richText: {
        isLeaf: true,
        type: 'unknown',
        label: 'richText',
        value: null,
      },
    });
  });

  it('should respect declared labels when present', () => {
    const inputSchema = [
      {
        type: 'object' as const,
        properties: {
          messageId: { type: 'string' as const, label: 'Message ID' },
        },
      },
    ];

    expect(inputSchemaToOutputSchema(inputSchema)).toEqual({
      messageId: {
        isLeaf: true,
        type: 'string',
        label: 'Message ID',
        value: null,
      },
    });
  });

  it('should return an empty schema when the input is empty', () => {
    expect(inputSchemaToOutputSchema([])).toEqual({});
  });

  it('should return an empty schema when the root is not an object', () => {
    expect(inputSchemaToOutputSchema([{ type: 'string' as const }])).toEqual(
      {},
    );
  });

  it('should return an empty schema when the root object has no properties', () => {
    expect(inputSchemaToOutputSchema([{ type: 'object' as const }])).toEqual(
      {},
    );
  });
});

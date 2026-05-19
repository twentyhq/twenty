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

  it('preserves multiline on string properties when true', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: {
        body: { type: 'string', multiline: true },
      },
    });

    expect(result[0].properties?.body).toEqual({
      type: 'string',
      multiline: true,
    });
  });

  it('does not set multiline when false or omitted', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: {
        title: { type: 'string', multiline: false },
        other: { type: 'string' },
      },
    });

    expect(result[0].properties?.title).toEqual({ type: 'string' });
    expect(result[0].properties?.other).toEqual({ type: 'string' });
  });

  it('preserves label on top-level and nested properties', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      label: 'Slack Message',
      properties: {
        slackChannelId: { type: 'string', label: 'Channel' },
        messageText: { type: 'string', label: 'Message text' },
        meta: {
          type: 'object',
          properties: {
            count: { type: 'integer', label: 'Count' },
          },
        },
      },
    });

    expect(result[0].label).toBe('Slack Message');
    expect(result[0].properties?.slackChannelId).toEqual({
      type: 'string',
      label: 'Channel',
    });
    expect(result[0].properties?.messageText).toEqual({
      type: 'string',
      label: 'Message text',
    });
    expect(result[0].properties?.meta?.properties?.count).toEqual({
      type: 'number',
      label: 'Count',
    });
  });

  it('does not set label when empty or omitted', () => {
    const result = jsonSchemaToInputSchema({
      type: 'object',
      properties: {
        empty: { type: 'string', label: '' },
        missing: { type: 'string' },
      },
    });

    expect(result[0].properties?.empty).toEqual({ type: 'string' });
    expect(result[0].properties?.missing).toEqual({ type: 'string' });
  });
});

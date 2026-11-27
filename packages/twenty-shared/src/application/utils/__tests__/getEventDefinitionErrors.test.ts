import { getEventDefinitionErrors } from '@/application/utils/getEventDefinitionErrors';
import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

const CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER =
  'a0b1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d';

const schemaWith = (
  properties: Record<string, InputJsonSchema>,
): InputJsonSchema => ({ type: 'object', properties });

describe('getEventDefinitionErrors', () => {
  it('should accept a record property, formatted strings and an untyped property', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        schema: {
          ...schemaWith({
            conversationId: {
              type: 'record',
              objectUniversalIdentifier:
                CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
            },
            text: { type: 'string', label: 'Text' },
            sentAt: { type: 'string', format: 'date-time' },
            externalId: { type: 'string', format: 'uuid' },
            priority: { type: 'integer', minimum: 1, maximum: 5 },
            channel: { type: 'string', enum: ['email', 'chat'] },
            metadata: {},
          }),
          required: ['conversationId'],
        },
      }),
    ).toEqual([]);
  });

  it('should reject a name that is not camelCase', () => {
    expect(
      getEventDefinitionErrors({
        name: 'message-added',
        schema: schemaWith({}),
      }),
    ).toHaveLength(1);
  });

  it('should reject a schema that is not an object schema', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        schema: { type: 'string' },
      }),
    ).toEqual(['Event "messageAdded" schema must be an object schema']);
  });

  it('should reject nested and array properties', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        schema: schemaWith({
          author: { type: 'object', properties: { name: { type: 'string' } } },
          tags: { type: 'array', items: { type: 'string' } },
        }),
      }),
    ).toEqual([
      'Event "messageAdded" property "author" type must be one of: string, number, integer, boolean, record, or left out to accept any JSON value',
      'Event "messageAdded" property "author" cannot use "properties": event properties are flat',
      'Event "messageAdded" property "tags" type must be one of: string, number, integer, boolean, record, or left out to accept any JSON value',
      'Event "messageAdded" property "tags" cannot use "items": event properties are flat',
    ]);
  });

  it('should reject a record property without an object', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        schema: schemaWith({
          conversationId: {
            type: 'record',
            objectUniversalIdentifier: 'not-a-uuid',
          },
        }),
      }),
    ).toHaveLength(1);
  });

  it('should reject an unsupported format and a format on a non-string', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        schema: schemaWith({
          email: { type: 'string', format: 'email' },
          count: { type: 'number', format: 'uuid' },
        }),
      }),
    ).toHaveLength(2);
  });

  it('should reject a required name that is not a property', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        schema: {
          type: 'object',
          properties: { text: { type: 'string' } },
          required: ['missing'],
        },
      }),
    ).toEqual([
      'Event "messageAdded" requires "missing", which is not one of its properties',
    ]);
  });

  it('should reject constraints of the wrong shape', () => {
    const rawSchema = JSON.parse(
      '{"type":"object","properties":{"channel":{"type":"string","enum":"email"},"attempts":{"type":"integer","minimum":"1","maximum":3}},"required":"channel"}',
    );

    expect(
      getEventDefinitionErrors({ name: 'messageAdded', schema: rawSchema }),
    ).toEqual([
      'Event "messageAdded" property "channel" enum must be an array of allowed values',
      'Event "messageAdded" property "attempts" minimum must be a number',
      'Event "messageAdded" schema required must be a list of names',
    ]);
  });

  it('should reject a schema written as the former property list', () => {
    const legacySchema = JSON.parse(
      '{"type":"object","properties":[{"name":"text","type":"TEXT"}]}',
    );

    expect(
      getEventDefinitionErrors({ name: 'messageAdded', schema: legacySchema }),
    ).not.toEqual([]);
  });
});

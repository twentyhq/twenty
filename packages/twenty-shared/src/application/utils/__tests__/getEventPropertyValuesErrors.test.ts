import { getEventPropertyValuesErrors } from '@/application/utils/getEventPropertyValuesErrors';
import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';

const SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    conversationId: {
      type: 'record',
      objectUniversalIdentifier: 'a0b1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d',
    },
    text: { type: 'string' },
    count: { type: 'number' },
    attempts: { type: 'integer', minimum: 1, maximum: 3 },
    isInternal: { type: 'boolean' },
    sentAt: { type: 'string', format: 'date-time' },
    externalId: { type: 'string', format: 'uuid' },
    channel: { type: 'string', enum: ['email', 'chat'] },
    metadata: {},
  },
  required: ['conversationId'],
};

describe('getEventPropertyValuesErrors', () => {
  it('should accept values matching their schemas', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        schema: SCHEMA,
        values: {
          conversationId: '0f5c2c1e-4b7a-4f3e-9d2a-6c8b1e0a7d34',
          text: 'Hello',
          count: 2.5,
          attempts: 2,
          isInternal: false,
          sentAt: '2026-10-27T10:00:00.000Z',
          externalId: '7c1e2a3b-4d5e-4f60-8a9b-0c1d2e3f4a5b',
          channel: 'chat',
          metadata: { source: 'widget' },
        },
      }),
    ).toEqual([]);
  });

  it('should accept null for optional properties', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        schema: SCHEMA,
        values: {
          conversationId: '0f5c2c1e-4b7a-4f3e-9d2a-6c8b1e0a7d34',
          text: null,
        },
      }),
    ).toEqual([]);
  });

  it('should reject a missing required property', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        schema: SCHEMA,
        values: {},
      }),
    ).toEqual(['Event "messageAdded" property "conversationId" is required']);
  });

  it('should reject undeclared properties and mistyped values', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        schema: SCHEMA,
        values: {
          conversationId: 'not-a-uuid',
          count: Number.NaN,
          attempts: 1.5,
          sentAt: 'yesterday',
          externalId: 'abc',
          unknown: true,
        },
      }),
    ).toEqual([
      'Event "messageAdded" has no property "unknown"',
      'Event "messageAdded" property "conversationId" must be a record value',
      'Event "messageAdded" property "count" must be a number value',
      'Event "messageAdded" property "attempts" must be a integer value',
      'Event "messageAdded" property "sentAt" must be a date-time value',
      'Event "messageAdded" property "externalId" must be a uuid value',
    ]);
  });

  it('should reject values outside their enum or bounds', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        schema: SCHEMA,
        values: {
          conversationId: '0f5c2c1e-4b7a-4f3e-9d2a-6c8b1e0a7d34',
          attempts: 4,
          channel: 'sms',
        },
      }),
    ).toEqual([
      'Event "messageAdded" property "attempts" must be at most 3',
      'Event "messageAdded" property "channel" must be one of: email, chat',
    ]);
  });

  it('should treat a property named like an inherited member as absent when omitted', () => {
    // A literal key named constructor is typed against Object.prototype
    const stringProperty: InputJsonSchema = { type: 'string' };
    const schema: InputJsonSchema = {
      type: 'object',
      properties: { constructor: stringProperty },
    };

    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        schema,
        values: {},
      }),
    ).toEqual([]);
  });

  it('should require a property named like an inherited member', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        schema: {
          type: 'object',
          properties: { toString: {} },
          required: ['toString'],
        },
        values: {},
      }),
    ).toEqual(['Event "messageAdded" property "toString" is required']);
  });
});

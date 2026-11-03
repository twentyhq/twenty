import { type EventPropertyManifest } from '@/application/eventManifestType';
import { getEventPropertyValuesErrors } from '@/application/utils/getEventPropertyValuesErrors';

const PROPERTIES: EventPropertyManifest[] = [
  {
    name: 'conversationId',
    type: 'RECORD_REFERENCE',
    objectUniversalIdentifier: 'a0b1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d',
    isRequired: true,
  },
  { name: 'text', type: 'TEXT' },
  { name: 'count', type: 'NUMBER' },
  { name: 'isInternal', type: 'BOOLEAN' },
  { name: 'sentAt', type: 'DATE_TIME' },
  { name: 'metadata', type: 'RAW_JSON' },
];

describe('getEventPropertyValuesErrors', () => {
  it('should accept values matching their declared types', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        properties: PROPERTIES,
        values: {
          conversationId: '0f5c2c1e-4b7a-4f3e-9d2a-6c8b1e0a7d34',
          text: 'Hello',
          count: 2,
          isInternal: false,
          sentAt: '2026-10-27T10:00:00.000Z',
          metadata: { source: 'widget' },
        },
      }),
    ).toEqual([]);
  });

  it('should accept null for optional properties', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        properties: PROPERTIES,
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
        properties: PROPERTIES,
        values: {},
      }),
    ).toEqual(['Event "messageAdded" property "conversationId" is required']);
  });

  it('should reject undeclared properties and mistyped values', () => {
    expect(
      getEventPropertyValuesErrors({
        eventName: 'messageAdded',
        properties: PROPERTIES,
        values: {
          conversationId: 'not-a-uuid',
          count: Number.NaN,
          sentAt: 'yesterday',
          unknown: true,
        },
      }),
    ).toEqual([
      'Event "messageAdded" has no property "unknown"',
      'Event "messageAdded" property "conversationId" must be a RECORD_REFERENCE value',
      'Event "messageAdded" property "count" must be a NUMBER value',
      'Event "messageAdded" property "sentAt" must be a DATE_TIME value',
    ]);
  });
});

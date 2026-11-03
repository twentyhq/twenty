import { getEventDefinitionErrors } from '@/application/utils/getEventDefinitionErrors';

const CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER =
  'a0b1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d';

describe('getEventDefinitionErrors', () => {
  it('should accept a record scope pointing at a record reference property', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        properties: [
          {
            name: 'conversationId',
            type: 'RECORD_REFERENCE',
            objectUniversalIdentifier: CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER,
            isRequired: true,
          },
          { name: 'text', type: 'TEXT' },
        ],
        capabilities: {
          realtime: {
            scopes: [
              { kind: 'record', property: 'conversationId' },
              { kind: 'visitor' },
            ],
          },
        },
      }),
    ).toEqual([]);
  });

  it('should reject a name that is not camelCase', () => {
    expect(
      getEventDefinitionErrors({ name: 'message-added', properties: [] }),
    ).toHaveLength(1);
  });

  it('should reject duplicate property names', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        properties: [
          { name: 'text', type: 'TEXT' },
          { name: 'text', type: 'NUMBER' },
        ],
      }),
    ).toEqual(['Event "messageAdded" declares property "text" more than once']);
  });

  it('should reject a record reference without an object', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        properties: [
          {
            name: 'conversationId',
            type: 'RECORD_REFERENCE',
            objectUniversalIdentifier: 'not-a-uuid',
          },
        ],
      }),
    ).toHaveLength(1);
  });

  it('should reject a record scope on a property that is not a record reference', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        properties: [{ name: 'conversationId', type: 'UUID' }],
        capabilities: {
          realtime: {
            scopes: [{ kind: 'record', property: 'conversationId' }],
          },
        },
      }),
    ).toEqual([
      'Event "messageAdded" record scope must name a RECORD_REFERENCE property, got "conversationId"',
    ]);
  });

  it('should reject the same scope declared twice', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        properties: [],
        capabilities: {
          realtime: { scopes: [{ kind: 'visitor' }, { kind: 'visitor' }] },
        },
      }),
    ).toEqual(['Event "messageAdded" declares realtime scope "visitor" twice']);
  });
});

import { getEventDefinitionErrors } from '@/application/utils/getEventDefinitionErrors';

const CONVERSATION_OBJECT_UNIVERSAL_IDENTIFIER =
  'a0b1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d';

describe('getEventDefinitionErrors', () => {
  it('should accept a record reference property pointing at an object', () => {
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

  it('should reject a capability that is not supported', () => {
    expect(
      getEventDefinitionErrors({
        name: 'messageAdded',
        properties: [],
        capabilities: JSON.parse('{"triggers":true}'),
      }),
    ).toEqual([
      'Event "messageAdded" declares capability "triggers", which is not supported',
    ]);
  });
});

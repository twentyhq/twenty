import { isValidAgentResponseSchemaPropertyKey } from '../is-valid-agent-response-schema-property-key.util';

describe('isValidAgentResponseSchemaPropertyKey', () => {
  it.each([
    'summary',
    'status_2',
    'meetings.brief',
    'a-b',
    'A',
    'a'.repeat(64),
  ])('should accept "%s"', (propertyKey) => {
    expect(isValidAgentResponseSchemaPropertyKey(propertyKey)).toBe(true);
  });

  it.each([
    ['a name with spaces', 'meetings brief'],
    ['leading space', ' summary'],
    ['empty string', ''],
    ['over 64 characters', 'a'.repeat(65)],
    ['unsupported symbol', 'meetings@brief'],
    ['unicode', 'résumé'],
  ])('should reject %s', (_label, propertyKey) => {
    expect(isValidAgentResponseSchemaPropertyKey(propertyKey)).toBe(false);
  });
});

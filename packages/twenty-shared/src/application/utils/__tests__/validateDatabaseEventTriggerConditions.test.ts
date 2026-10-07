import { validateDatabaseEventTriggerConditions } from '@/application/utils/validateDatabaseEventTriggerConditions';

const EVENT_NAME = 'messageParticipant.updated';

describe('validateDatabaseEventTriggerConditions', () => {
  it('accepts the full shape', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: {
          actor: ['system'],
          record: {
            personId: { is: 'NOT_NULL' },
            or: [
              { role: { eq: 'FROM' } },
              { handle: { ilike: '%@twenty.com' } },
            ],
            emails: { primaryEmail: { startsWith: 'a' } },
          },
          signals: { 'messaging.initialImport': false },
          onMismatch: 'deferUntilMatch',
        },
      }),
    ).toEqual([]);
  });

  it('accepts and, or and not nested in a composite field', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: {
          record: {
            emails: {
              or: [
                { primaryEmail: { eq: 'a@example.com' } },
                { primaryEmail: { eq: 'b@example.com' } },
              ],
              not: { primaryEmail: { like: '%@spam.com' } },
            },
          },
        },
      }),
    ).toEqual([]);
  });

  it('rejects eq and neq against null', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: {
          record: { personId: { eq: null }, companyId: { neq: null } },
        },
      }),
    ).toEqual([
      'record condition on "personId" compares "eq" with null, use "is" instead',
      'record condition on "companyId" compares "neq" with null, use "is" instead',
    ]);
  });

  it('rejects a non-object', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: 'nope',
      }),
    ).toEqual(['conditions must be an object']);
  });

  it('rejects unknown keys, actor types and signals', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: {
          extra: true,
          actor: ['robot', 'user', 'user'],
          signals: { 'billing.import': 'yes' },
        },
      }),
    ).toEqual([
      'conditions has unknown key "extra"',
      'conditions.actor has unknown actor type "robot"',
      'conditions.actor lists an actor type twice',
      'conditions.signals has unknown signal "billing.import"',
      'conditions.signals["billing.import"] must be a boolean',
    ]);
  });

  it('rejects unknown operators, bad operand values and mixed keys', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: {
          record: {
            personId: { contains: 'x' },
            role: { in: 'FROM' },
            handle: { eq: 'a', nested: { eq: 'b' } },
            'bad name': { eq: 1 },
            and: [],
          },
        },
      }),
    ).toEqual([
      'record condition on "personId" uses unknown operator "contains"',
      'record condition on "role" has an invalid value for "in"',
      'record condition on "handle" mixes operators and field names',
      'record condition field "bad name" is not a valid field name',
      'record condition "and" must be a non-empty array',
    ]);
  });

  it('caps nesting depth and leaf count', () => {
    const tooDeep = {
      and: [{ or: [{ not: { emails: { primaryEmail: { eq: 'a' } } } }] }],
    };
    const tooManyLeaves = Object.fromEntries(
      Array.from({ length: 21 }, (_, index) => [
        `field${index}`,
        { eq: index },
      ]),
    );

    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: { record: tooDeep },
      }),
    ).toEqual([
      'record condition at "and[0].or[0].not" is nested deeper than 3 levels',
    ]);
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: { record: tooManyLeaves },
      }),
    ).toEqual(['conditions.record has more than 20 field conditions']);
  });

  it('refuses record conditions and deferral on wildcard event names', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: '*.updated',
        conditions: {
          record: { personId: { is: 'NOT_NULL' } },
          onMismatch: 'deferUntilMatch',
        },
      }),
    ).toEqual([
      'conditions.record needs an event name with a concrete object, not a wildcard',
      'conditions.onMismatch "deferUntilMatch" needs conditions.signals',
      'conditions.onMismatch "deferUntilMatch" needs an event name with a concrete object, not a wildcard',
    ]);
  });

  it('rejects an unknown onMismatch value', () => {
    expect(
      validateDatabaseEventTriggerConditions({
        eventName: EVENT_NAME,
        conditions: { onMismatch: 'retry' },
      }),
    ).toEqual(['conditions.onMismatch must be one of drop, deferUntilMatch']);
  });
});

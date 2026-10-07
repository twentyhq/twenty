import { type DatabaseEventTriggerRecordCondition } from 'twenty-shared/application';

import { evaluateDatabaseEventTriggerRecordCondition } from 'src/engine/workspace-event-emitter/utils/evaluate-database-event-trigger-record-condition.util';

const record = {
  personId: 'person-1',
  role: 'FROM',
  handle: 'Ada@Twenty.com',
  score: 7,
  receivedAt: '2026-10-06T09:00:00.000Z',
  emails: { primaryEmail: 'ada@twenty.com' },
  workspaceMemberId: null,
};

const cases: [string, DatabaseEventTriggerRecordCondition, boolean][] = [
  ['eq', { personId: { eq: 'person-1' } }, true],
  ['eq miss', { personId: { eq: 'person-2' } }, false],
  ['neq', { role: { neq: 'TO' } }, true],
  ['in', { role: { in: ['FROM', 'CC'] } }, true],
  ['in miss', { role: { in: ['TO'] } }, false],
  ['is NOT_NULL', { personId: { is: 'NOT_NULL' } }, true],
  ['is NULL on null', { workspaceMemberId: { is: 'NULL' } }, true],
  ['is NULL on missing field', { companyId: { is: 'NULL' } }, true],
  ['eq on missing field', { companyId: { eq: 'x' } }, false],
  ['gt number', { score: { gt: 5 } }, true],
  ['gte number', { score: { gte: 7 } }, true],
  ['lt date string', { receivedAt: { lt: '2026-10-07' } }, true],
  ['lte miss', { score: { lte: 6 } }, false],
  ['like', { handle: { like: '%@Twenty.com' } }, true],
  ['like is case sensitive', { handle: { like: '%@twenty.com' } }, false],
  ['ilike', { handle: { ilike: '%@twenty.COM' } }, true],
  ['like single character wildcard', { role: { like: 'FR_M' } }, true],
  ['like escaped wildcard', { handle: { like: 'Ada@Twenty.com\\%' } }, false],
  ['neq on null field', { workspaceMemberId: { neq: 'member-1' } }, false],
  ['neq on missing field', { companyId: { neq: 'company-1' } }, false],
  ['in on null field', { workspaceMemberId: { in: ['member-1'] } }, false],
  ['gt on null field', { workspaceMemberId: { gt: 'a' } }, false],
  ['eq null never matches', { workspaceMemberId: { eq: null } }, false],
  [
    'not of a comparison on a null field',
    { not: { workspaceMemberId: { eq: 'member-1' } } },
    false,
  ],
  [
    'not of is on a null field',
    { not: { workspaceMemberId: { is: 'NOT_NULL' } } },
    true,
  ],
  [
    'or with one unknown branch',
    {
      or: [{ workspaceMemberId: { eq: 'member-1' } }, { role: { eq: 'FROM' } }],
    },
    true,
  ],
  [
    'and with one unknown branch',
    {
      and: [
        { workspaceMemberId: { neq: 'member-1' } },
        { role: { eq: 'FROM' } },
      ],
    },
    false,
  ],
  [
    'or nested in a composite field',
    {
      emails: {
        or: [
          { primaryEmail: { eq: 'grace@twenty.com' } },
          { primaryEmail: { eq: 'ada@twenty.com' } },
        ],
      },
    },
    true,
  ],
  ['startsWith', { handle: { startsWith: 'Ada' } }, true],
  ['two operators on one field', { score: { gt: 5, lt: 10 } }, true],
  [
    'composite field',
    { emails: { primaryEmail: { eq: 'ada@twenty.com' } } },
    true,
  ],
];

describe('evaluateDatabaseEventTriggerRecordCondition', () => {
  it.each(cases)('%s', (_label, condition, expected) => {
    expect(evaluateDatabaseEventTriggerRecordCondition(record, condition)).toBe(
      expected,
    );
  });

  it('combines and, or and not', () => {
    expect(
      evaluateDatabaseEventTriggerRecordCondition(record, {
        and: [
          { personId: { is: 'NOT_NULL' } },
          { or: [{ role: { eq: 'TO' } }, { role: { eq: 'FROM' } }] },
          { not: { workspaceMemberId: { is: 'NOT_NULL' } } },
        ],
      }),
    ).toBe(true);
    expect(
      evaluateDatabaseEventTriggerRecordCondition(record, {
        and: [{ personId: { is: 'NOT_NULL' } }, { role: { eq: 'TO' } }],
      }),
    ).toBe(false);
  });

  it('treats sibling field conditions as an implicit and', () => {
    expect(
      evaluateDatabaseEventTriggerRecordCondition(record, {
        personId: { is: 'NOT_NULL' },
        role: { eq: 'TO' },
      }),
    ).toBe(false);
  });

  it('rejects a record that is not an object', () => {
    expect(
      evaluateDatabaseEventTriggerRecordCondition(undefined, {
        personId: { is: 'NOT_NULL' },
      }),
    ).toBe(false);
    expect(
      evaluateDatabaseEventTriggerRecordCondition(undefined, {
        personId: { is: 'NULL' },
      }),
    ).toBe(true);
  });
});

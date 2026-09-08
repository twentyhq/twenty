import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { excludeNonAuditLoggedFieldsFromEventsDiff } from 'src/modules/timeline/utils/exclude-non-audit-logged-fields-from-events-diff.util';

const buildEvent = (
  diff?: Record<string, unknown>,
): ObjectRecordBaseEvent<Record<string, unknown>> =>
  ({
    recordId: 'company-record-id',
    properties: { diff },
  }) as ObjectRecordBaseEvent<Record<string, unknown>>;

describe('excludeNonAuditLoggedFieldsFromEventsDiff', () => {
  it('drops the non audit logged fields from the diff', () => {
    const [event] = excludeNonAuditLoggedFieldsFromEventsDiff({
      events: [
        buildEvent({
          name: { before: 'Acme', after: 'Acme Inc' },
          lastContactAt: { before: null, after: '2026-09-06T02:00:00.000Z' },
        }),
      ],
      nonAuditLoggedFieldNames: new Set(['lastContactAt']),
    });

    expect(event.properties.diff).toEqual({
      name: { before: 'Acme', after: 'Acme Inc' },
    });
  });

  it('empties a diff made only of non audit logged fields', () => {
    const [event] = excludeNonAuditLoggedFieldsFromEventsDiff({
      events: [
        buildEvent({
          lastContactAt: { before: null, after: '2026-09-06T02:00:00.000Z' },
        }),
      ],
      nonAuditLoggedFieldNames: new Set(['lastContactAt']),
    });

    expect(event.properties.diff).toEqual({});
  });

  it('returns the very same events when no diff carries an excluded field', () => {
    const events = [
      buildEvent({ name: { before: 'Acme', after: 'Acme Inc' } }),
      buildEvent(),
    ];

    expect(
      excludeNonAuditLoggedFieldsFromEventsDiff({
        events,
        nonAuditLoggedFieldNames: new Set(['lastContactAt']),
      }),
    ).toBe(events);
  });

  it('leaves events without a diff untouched while filtering the others', () => {
    const eventWithoutDiff = buildEvent();

    const [event, untouchedEvent] = excludeNonAuditLoggedFieldsFromEventsDiff({
      events: [
        buildEvent({
          name: { before: 'Acme', after: 'Acme Inc' },
          lastContactAt: { before: null, after: '2026-09-06T02:00:00.000Z' },
        }),
        eventWithoutDiff,
      ],
      nonAuditLoggedFieldNames: new Set(['lastContactAt']),
    });

    expect(event.properties.diff).toEqual({
      name: { before: 'Acme', after: 'Acme Inc' },
    });
    expect(untouchedEvent).toBe(eventWithoutDiff);
  });
});

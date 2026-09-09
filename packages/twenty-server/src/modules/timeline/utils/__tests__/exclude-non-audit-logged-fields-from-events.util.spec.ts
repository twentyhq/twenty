import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { excludeNonAuditLoggedFieldsFromEvents } from 'src/modules/timeline/utils/exclude-non-audit-logged-fields-from-events.util';

const buildEvent = (
  diff?: Record<string, unknown>,
  updatedFields?: string[],
): ObjectRecordBaseEvent<Record<string, unknown>> =>
  ({
    recordId: 'company-record-id',
    properties: { diff, updatedFields },
  }) as ObjectRecordBaseEvent<Record<string, unknown>>;

describe('excludeNonAuditLoggedFieldsFromEvents', () => {
  it('drops the non audit logged fields from the diff', () => {
    const [event] = excludeNonAuditLoggedFieldsFromEvents({
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
    const [event] = excludeNonAuditLoggedFieldsFromEvents({
      events: [
        buildEvent({
          lastContactAt: { before: null, after: '2026-09-06T02:00:00.000Z' },
        }),
      ],
      nonAuditLoggedFieldNames: new Set(['lastContactAt']),
    });

    expect(event.properties.diff).toEqual({});
  });

  it('returns the very same events when none carries an excluded field', () => {
    const events = [
      buildEvent({ name: { before: 'Acme', after: 'Acme Inc' } }, ['name']),
      buildEvent(),
    ];

    expect(
      excludeNonAuditLoggedFieldsFromEvents({
        events,
        nonAuditLoggedFieldNames: new Set(['lastContactAt']),
      }),
    ).toEqual(events);
  });

  it('leaves events without a diff untouched while filtering the others', () => {
    const eventWithoutDiff = buildEvent();

    const [event, untouchedEvent] = excludeNonAuditLoggedFieldsFromEvents({
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

  it('filters updatedFields alongside the diff so the two agree', () => {
    const [event] = excludeNonAuditLoggedFieldsFromEvents({
      events: [
        buildEvent(
          {
            name: { before: 'Acme', after: 'Acme Inc' },
            lastContactItemMessage: { before: null, after: { id: 'message' } },
          },
          ['name', 'lastContactItemMessage', 'lastContactItemMessageId'],
        ),
      ],
      nonAuditLoggedFieldNames: new Set([
        'lastContactItemMessage',
        'lastContactItemMessageId',
      ]),
    });

    expect(event.properties.updatedFields).toEqual(['name']);
    expect(Object.keys(event.properties.diff ?? {})).toEqual(['name']);
  });

  it('filters an event whose only excluded field is in updatedFields', () => {
    const [event] = excludeNonAuditLoggedFieldsFromEvents({
      events: [buildEvent(undefined, ['position', 'positionId'])],
      nonAuditLoggedFieldNames: new Set(['position']),
    });

    expect(event.properties.updatedFields).toEqual(['positionId']);
  });
});

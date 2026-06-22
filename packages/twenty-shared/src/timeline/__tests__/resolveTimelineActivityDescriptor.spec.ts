import { resolveTimelineActivityDescriptor } from '@/timeline/resolveTimelineActivityDescriptor';

describe('resolveTimelineActivityDescriptor', () => {
  it('prefers the persisted kind over the legacy name', () => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: 'linkedCalendarEvent',
        name: 'message.linked',
        linkedObjectNameSingular: 'calendarEvent',
      }),
    ).toEqual({ kind: 'linkedCalendarEvent', action: 'linked' });
  });

  it.each([
    ['company.created', 'created'],
    ['company.updated', 'updated'],
    ['company.deleted', 'deleted'],
    ['company.restored', 'restored'],
  ])('resolves a record change from "%s"', (name, action) => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: null,
        name,
        linkedObjectNameSingular: null,
      }),
    ).toEqual({ kind: 'recordChange', action });
  });

  it('fixes the historical calendar event mislabeled as message.linked', () => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: null,
        name: 'message.linked',
        linkedObjectNameSingular: 'calendarEvent',
      }),
    ).toEqual({ kind: 'linkedCalendarEvent', action: 'linked' });
  });

  it.each([
    ['note', 'linkedNote'],
    ['task', 'linkedTask'],
    ['message', 'linkedMessage'],
    ['calendarEvent', 'linkedCalendarEvent'],
  ])(
    'resolves linked object "%s" to kind "%s"',
    (linkedObjectNameSingular, kind) => {
      expect(
        resolveTimelineActivityDescriptor({
          kind: null,
          name: 'linked-note.created',
          linkedObjectNameSingular,
        }),
      ).toEqual({ kind, action: 'created' });
    },
  );

  it('falls back to linkedRecord for unknown linked object types', () => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: null,
        name: 'rocket.linked',
        linkedObjectNameSingular: 'rocket',
      }),
    ).toEqual({ kind: 'linkedRecord', action: 'linked' });
  });

  it('falls back to a linked action for null or unrecognized names', () => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: 'linkedMessage',
        name: null,
        linkedObjectNameSingular: 'message',
      }),
    ).toEqual({ kind: 'linkedMessage', action: 'linked' });
  });
});

import {
  legacyDecodeTimelineActivityKind,
  parseTimelineActivityAction,
  resolveTimelineActivityDescriptor,
} from '@/timeline/resolve-timeline-activity-descriptor';

describe('parseTimelineActivityAction', () => {
  it.each([
    ['company.created', 'created'],
    ['company.updated', 'updated'],
    ['company.deleted', 'deleted'],
    ['company.restored', 'restored'],
    ['linked-note.created', 'created'],
    ['linked-task.updated', 'updated'],
    ['message.linked', 'linked'],
    ['calendarEvent.linked', 'linked'],
  ])('parses the action from "%s" as "%s"', (name, expected) => {
    expect(parseTimelineActivityAction(name)).toBe(expected);
  });

  it('falls back to "linked" for null or unrecognized names', () => {
    expect(parseTimelineActivityAction(null)).toBe('linked');
    expect(parseTimelineActivityAction('garbage')).toBe('linked');
  });
});

describe('legacyDecodeTimelineActivityKind', () => {
  it('returns recordChange when there is no linked object', () => {
    expect(
      legacyDecodeTimelineActivityKind({
        name: 'company.updated',
        linkedObjectNameSingular: null,
      }),
    ).toBe('recordChange');
  });

  it.each([
    ['note', 'linkedNote'],
    ['task', 'linkedTask'],
    ['message', 'linkedMessage'],
    ['calendarEvent', 'linkedCalendarEvent'],
  ])('maps linked object "%s" to "%s"', (linkedObject, expected) => {
    expect(
      legacyDecodeTimelineActivityKind({
        name: 'whatever.linked',
        linkedObjectNameSingular: linkedObject,
      }),
    ).toBe(expected);
  });

  it('maps an unknown linked object to the generic linkedRecord kind', () => {
    expect(
      legacyDecodeTimelineActivityKind({
        name: 'company.linked',
        linkedObjectNameSingular: 'company',
      }),
    ).toBe('linkedRecord');
  });
});

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

  it('resolves a record change from name when kind is absent', () => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: null,
        name: 'company.updated',
        linkedObjectNameSingular: null,
      }),
    ).toEqual({ kind: 'recordChange', action: 'updated' });
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

  it('resolves linked notes and tasks with their action', () => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: null,
        name: 'linked-note.created',
        linkedObjectNameSingular: 'note',
      }),
    ).toEqual({ kind: 'linkedNote', action: 'created' });
  });

  it('falls back to linkedRecord for unknown linked object types', () => {
    expect(
      resolveTimelineActivityDescriptor({
        kind: null,
        name: 'rocket.linked',
        linkedObjectNameSingular: 'rocket',
      }),
    ).toEqual({ kind: 'linkedRecord', action: 'linked' });
  });
});

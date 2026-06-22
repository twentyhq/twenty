import { parseTimelineActivityVerb } from '@/timeline/parseTimelineActivityVerb';

describe('parseTimelineActivityVerb', () => {
  it.each([
    ['company.created', 'created'],
    ['company.updated', 'updated'],
    ['company.deleted', 'deleted'],
    ['company.restored', 'restored'],
    ['linked-note.created', 'created'],
    ['linked-task.updated', 'updated'],
    ['message.linked', 'linked'],
    ['calendarEvent.linked', 'linked'],
  ])('parses the verb from "%s" as "%s"', (name, expected) => {
    expect(parseTimelineActivityVerb(name)).toBe(expected);
  });

  it('falls back to "linked" for null or unrecognized names', () => {
    expect(parseTimelineActivityVerb(null)).toBe('linked');
    expect(parseTimelineActivityVerb('deal.went_cold')).toBe('linked');
  });
});

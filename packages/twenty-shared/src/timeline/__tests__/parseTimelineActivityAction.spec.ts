import { parseTimelineActivityAction } from '@/timeline/parseTimelineActivityAction';

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
    expect(parseTimelineActivityAction('deal.went_cold')).toBe('linked');
  });
});

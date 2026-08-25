import { isTimelineActivityAction } from '@/timeline/TimelineActivityAction';

describe('isTimelineActivityAction', () => {
  it.each(['created', 'updated', 'deleted', 'restored', 'linked', 'unlinked'])(
    'accepts "%s"',
    (action) => {
      expect(isTimelineActivityAction(action)).toBe(true);
    },
  );

  it.each([null, undefined, '', 'went_cold'])('rejects %p', (value) => {
    expect(isTimelineActivityAction(value)).toBe(false);
  });
});

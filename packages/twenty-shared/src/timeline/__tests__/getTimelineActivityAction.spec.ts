import { getTimelineActivityAction } from '@/timeline/getTimelineActivityAction';

describe('getTimelineActivityAction', () => {
  it('should prefer the stored action over the name', () => {
    expect(
      getTimelineActivityAction({
        action: 'linked',
        name: 'linked-note.created',
      }),
    ).toBe('linked');
    expect(
      getTimelineActivityAction({
        action: 'unlinked',
        name: 'linked-note.deleted',
      }),
    ).toBe('unlinked');
  });

  it('should map legacy linked names to link semantics when no action is stored', () => {
    expect(getTimelineActivityAction({ name: 'linked-note.created' })).toBe(
      'linked',
    );
    expect(getTimelineActivityAction({ name: 'linked-note.deleted' })).toBe(
      'unlinked',
    );
    expect(
      getTimelineActivityAction({ action: null, name: 'linked-task.updated' }),
    ).toBe('updated');
  });

  it('should keep record event names as they are', () => {
    expect(getTimelineActivityAction({ name: 'company.created' })).toBe(
      'created',
    );
    expect(getTimelineActivityAction({ name: 'company.restored' })).toBe(
      'restored',
    );
    expect(getTimelineActivityAction({ name: 'message.linked' })).toBe(
      'linked',
    );
  });

  it('should ignore a stored action outside the known set', () => {
    expect(
      getTimelineActivityAction({
        action: 'exploded',
        name: 'company.updated',
      }),
    ).toBe('updated');
  });
});

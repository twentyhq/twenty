import { TimelineActivityUpdateOnePreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-update-one.pre-query-hook';

describe('TimelineActivityUpdateOnePreQueryHook', () => {
  it('does not let an application change the attributed workspace member', async () => {
    const hook = new TimelineActivityUpdateOnePreQueryHook();

    await expect(
      hook.execute({ type: 'application' } as never, 'timelineActivity', {
        data: {
          workspaceMemberId: '00000000-0000-4000-8000-000000000001',
        },
        filter: { id: { eq: 'activity-id' } },
      } as never),
    ).resolves.toMatchObject({ data: { workspaceMemberId: null } });
  });
});

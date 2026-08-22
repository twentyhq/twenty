import { TimelineActivityCreateQueryHookService } from 'src/modules/timeline/query-hooks/timeline-activity-create-query-hook.service';
import { type TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';

const TYPE_ID = '00000000-0000-4000-8000-000000000001';
const APPLICATION_ID = '00000000-0000-4000-8000-000000000004';

const snapshot = {
  id: TYPE_ID,
  universalIdentifier: '00000000-0000-4000-8000-000000000002',
  name: 'deploymentCompleted',
  label: 'completed a deployment',
  action: 'updated' as const,
  icon: 'IconRocket',
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: '00000000-0000-4000-8000-000000000003',
};

describe('TimelineActivityCreateQueryHookService', () => {
  it('resolves each type once and replaces client-provided snapshots', async () => {
    const getTimelineActivityTypeByIdOrThrow = jest.fn().mockResolvedValue({
      id: TYPE_ID,
      applicationId: APPLICATION_ID,
      snapshot,
    });
    const service = new TimelineActivityCreateQueryHookService({
      getTimelineActivityTypeByIdOrThrow,
    } as unknown as TimelineActivityTypeCacheService);

    await expect(
      service.stampTimelineActivityTypeSnapshot({
        workspaceId: 'workspace-id',
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            timelineActivityTypeSnapshot: { label: 'forged' },
            targetPersonId: '00000000-0000-4000-8000-000000000010',
          },
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000011',
          },
        ],
      }),
    ).resolves.toEqual([
      {
        timelineActivityTypeId: TYPE_ID,
        timelineActivityTypeSnapshot: snapshot,
        targetPersonId: '00000000-0000-4000-8000-000000000010',
      },
      {
        timelineActivityTypeId: TYPE_ID,
        timelineActivityTypeSnapshot: snapshot,
        targetPersonId: '00000000-0000-4000-8000-000000000011',
      },
    ]);

    expect(getTimelineActivityTypeByIdOrThrow).toHaveBeenCalledTimes(1);
    expect(getTimelineActivityTypeByIdOrThrow).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      timelineActivityTypeId: TYPE_ID,
    });
  });

  it('rejects missing targets and partial linked records', async () => {
    const service = new TimelineActivityCreateQueryHookService(
      {} as TimelineActivityTypeCacheService,
    );

    await expect(
      service.stampTimelineActivityTypeSnapshot({
        workspaceId: 'workspace-id',
        records: [{ timelineActivityTypeId: TYPE_ID }],
      }),
    ).rejects.toThrow('A timeline activity requires exactly one target');
    await expect(
      service.stampTimelineActivityTypeSnapshot({
        workspaceId: 'workspace-id',
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000010',
            linkedRecordId: '00000000-0000-4000-8000-000000000012',
          },
        ],
      }),
    ).rejects.toThrow('complete linked record metadata');
  });

  it('rejects an untyped timeline activity before resolving metadata', async () => {
    const getTimelineActivityTypeByIdOrThrow = jest.fn();
    const service = new TimelineActivityCreateQueryHookService({
      getTimelineActivityTypeByIdOrThrow,
    } as unknown as TimelineActivityTypeCacheService);

    await expect(
      service.stampTimelineActivityTypeSnapshot({
        workspaceId: 'workspace-id',
        records: [{ properties: {} }],
      }),
    ).rejects.toThrow('A timeline activity type is required on creation');
    expect(getTimelineActivityTypeByIdOrThrow).not.toHaveBeenCalled();
  });

  it('rejects upserts because they could replace an existing type snapshot', async () => {
    const getTimelineActivityTypeByIdOrThrow = jest.fn();
    const service = new TimelineActivityCreateQueryHookService({
      getTimelineActivityTypeByIdOrThrow,
    } as unknown as TimelineActivityTypeCacheService);

    await expect(
      service.stampTimelineActivityTypeSnapshot({
        workspaceId: 'workspace-id',
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000010',
          },
        ],
        upsert: true,
      }),
    ).rejects.toThrow('Timeline activities cannot be upserted');
    expect(getTimelineActivityTypeByIdOrThrow).not.toHaveBeenCalled();
  });

  it('prevents an application from writing another application type', async () => {
    const getTimelineActivityTypeByIdOrThrow = jest.fn().mockResolvedValue({
      id: TYPE_ID,
      applicationId: APPLICATION_ID,
      snapshot,
    });
    const service = new TimelineActivityCreateQueryHookService({
      getTimelineActivityTypeByIdOrThrow,
    } as unknown as TimelineActivityTypeCacheService);

    await expect(
      service.stampTimelineActivityTypeSnapshot({
        workspaceId: 'workspace-id',
        applicationId: '00000000-0000-4000-8000-000000000099',
        records: [
          {
            timelineActivityTypeId: TYPE_ID,
            targetPersonId: '00000000-0000-4000-8000-000000000010',
          },
        ],
      }),
    ).rejects.toThrow(
      'An application can only create its own timeline activity types',
    );
  });

  it('rejects changing either immutable type field after creation', () => {
    const service = new TimelineActivityCreateQueryHookService(
      {} as TimelineActivityTypeCacheService,
    );

    expect(() =>
      service.assertTimelineActivityTypeIsNotUpdated([
        { timelineActivityTypeSnapshot: snapshot },
      ]),
    ).toThrow('A timeline activity type is immutable after creation');
    expect(() =>
      service.assertTimelineActivityTypeIsNotUpdated([
        { timelineActivityTypeId: TYPE_ID },
      ]),
    ).toThrow('A timeline activity type is immutable after creation');
    expect(() =>
      service.assertTimelineActivityTypeIsNotUpdated([{ properties: {} }]),
    ).not.toThrow();
  });
});

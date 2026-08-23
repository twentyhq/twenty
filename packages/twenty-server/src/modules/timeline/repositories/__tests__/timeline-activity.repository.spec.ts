import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const RECORD_ID = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000003';
const TIMELINE_ACTIVITY_TYPE_ID = '20202020-0000-4000-8000-000000000004';
const TIMELINE_ACTIVITY_TYPE_SNAPSHOT: TimelineActivityTypeSnapshot = {
  id: TIMELINE_ACTIVITY_TYPE_ID,
  universalIdentifier: '20202020-0000-4000-8000-000000000005',
  name: 'recordUpdated',
  label: 'was updated by',
  action: 'updated',
  icon: 'IconPencil',
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
};

describe('TimelineActivityRepository', () => {
  it('merges and stamps a recent row written without a snapshot', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const insert = jest.fn().mockResolvedValue(undefined);
    const workspaceRepository = {
      find: jest.fn().mockResolvedValue([
        {
          id: '20202020-0000-4000-8000-000000000006',
          targetPersonId: RECORD_ID,
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: null,
          linkedRecordId: null,
          properties: {
            diff: { name: { before: 'Before', after: 'First' } },
          },
        },
      ]),
      update,
      insert,
    };
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<void>) => callback(),
      ),
      getRepository: jest.fn().mockResolvedValue(workspaceRepository),
    } as unknown as GlobalWorkspaceOrmManager;
    const repository = new TimelineActivityRepository(
      globalWorkspaceOrmManager,
    );

    await repository.upsertTimelineActivities({
      objectSingularName: 'person',
      workspaceId: WORKSPACE_ID,
      payloads: [
        {
          happensAt: new Date('2026-08-23T09:00:00.000Z'),
          properties: {
            diff: { name: { before: 'First', after: 'Second' } },
          },
          recordId: RECORD_ID,
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
        },
      ],
    });

    expect(insert).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      '20202020-0000-4000-8000-000000000006',
      {
        properties: {
          diff: { name: { before: 'Before', after: 'Second' } },
        },
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
      },
    );
  });
});

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
      runInWorkspaceTransaction: jest.fn(
        async (
          callback: (transactionScope: {
            getRepository: () => typeof workspaceRepository;
            executeRawQuery: () => Promise<never[]>;
          }) => Promise<void>,
        ) =>
          callback({
            getRepository: () => workspaceRepository,
            executeRawQuery: jest.fn().mockResolvedValue([]),
          }),
      ),
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

  it('locks merge identities in a stable order before reading recent rows', async () => {
    const executeRawQuery = jest.fn().mockResolvedValue([]);
    const workspaceRepository = {
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (callback: () => Promise<void>) => callback(),
      ),
      runInWorkspaceTransaction: jest.fn(
        async (
          callback: (transactionScope: {
            getRepository: () => typeof workspaceRepository;
            executeRawQuery: typeof executeRawQuery;
          }) => Promise<void>,
        ) =>
          callback({
            getRepository: () => workspaceRepository,
            executeRawQuery,
          }),
      ),
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
          properties: {},
          recordId: 'record-z',
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
        },
        {
          happensAt: new Date('2026-08-23T09:00:00.000Z'),
          properties: {},
          recordId: 'record-a',
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          timelineActivityTypeId: TIMELINE_ACTIVITY_TYPE_ID,
          timelineActivityTypeSnapshot: TIMELINE_ACTIVITY_TYPE_SNAPSHOT,
        },
      ],
    });

    const lockStatement = `SELECT pg_advisory_xact_lock(hashtextextended("lockName", 0))
   FROM unnest($1::text[]) WITH ORDINALITY AS "locks"("lockName", "ordinality")
   ORDER BY "ordinality"`;

    expect(executeRawQuery).toHaveBeenCalledTimes(1);
    expect(executeRawQuery).toHaveBeenCalledWith(lockStatement, [
      [
        JSON.stringify([
          'timeline-activity-merge',
          WORKSPACE_ID,
          'person',
          'record-a',
          WORKSPACE_MEMBER_ID,
          TIMELINE_ACTIVITY_TYPE_ID,
        ]),
        JSON.stringify([
          'timeline-activity-merge',
          WORKSPACE_ID,
          'person',
          'record-z',
          WORKSPACE_MEMBER_ID,
          TIMELINE_ACTIVITY_TYPE_ID,
        ]),
      ],
    ]);
    expect(
      workspaceRepository.find.mock.invocationCallOrder[0],
    ).toBeGreaterThan(executeRawQuery.mock.invocationCallOrder[0]);
  });
});

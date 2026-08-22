import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';

const TYPE_ID = '20202020-0000-4000-8000-000000000001';
const TYPE_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const RECORD_ID = '20202020-0000-4000-8000-000000000003';

const buildSnapshot = (
  action: TimelineActivityTypeSnapshot['action'],
): TimelineActivityTypeSnapshot => ({
  id: TYPE_ID,
  universalIdentifier: TYPE_UNIVERSAL_IDENTIFIER,
  name: `record${action}`,
  label: action ?? 'custom event',
  action,
  icon: null,
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
});

const payload = {
  happensAt: new Date('2026-08-22T12:00:00.000Z'),
  timelineActivityTypeId: TYPE_ID,
  timelineActivityTypeSnapshot: buildSnapshot('updated'),
  objectSingularName: 'company',
  recordId: RECORD_ID,
  workspaceMemberId: undefined,
  properties: {
    diff: { name: { before: 'Acme', after: 'Acme Corp' } },
  },
};

const createRepository = (recentTimelineActivity: Record<string, unknown>) => {
  const ormRepository = {
    find: jest.fn().mockResolvedValue([recentTimelineActivity]),
    insert: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(
      async (operation: () => Promise<unknown>) => operation(),
    ),
    getRepository: jest.fn().mockResolvedValue(ormRepository),
  };

  return {
    repository: new TimelineActivityRepository(
      globalWorkspaceOrmManager as unknown as GlobalWorkspaceOrmManager,
    ),
    ormRepository,
  };
};

describe('TimelineActivityRepository', () => {
  it('merges matching semantics without rewriting the frozen snapshot', async () => {
    const { repository, ormRepository } = createRepository({
      id: 'activity-id',
      targetCompanyId: RECORD_ID,
      workspaceMemberId: null,
      timelineActivityTypeId: TYPE_ID,
      timelineActivityTypeSnapshot: buildSnapshot('updated'),
      linkedRecordId: null,
      properties: {
        diff: { name: { before: 'Old Acme', after: 'Acme' } },
      },
    });

    await repository.upsertTimelineActivities({
      objectSingularName: 'company',
      workspaceId: 'workspace-id',
      payloads: [payload],
    });

    expect(ormRepository.update).toHaveBeenCalledWith(
      'activity-id',
      expect.not.objectContaining({
        timelineActivityTypeId: expect.anything(),
        timelineActivityTypeSnapshot: expect.anything(),
      }),
    );
    expect(ormRepository.insert).not.toHaveBeenCalled();
  });

  it('does not merge rows whose frozen semantics differ', async () => {
    const { repository, ormRepository } = createRepository({
      id: 'activity-id',
      targetCompanyId: RECORD_ID,
      workspaceMemberId: null,
      timelineActivityTypeId: TYPE_ID,
      timelineActivityTypeSnapshot: buildSnapshot('created'),
      linkedRecordId: null,
      properties: {},
    });

    await repository.upsertTimelineActivities({
      objectSingularName: 'company',
      workspaceId: 'workspace-id',
      payloads: [payload],
    });

    expect(ormRepository.update).not.toHaveBeenCalled();
    expect(ormRepository.insert).toHaveBeenCalledTimes(1);
  });
});

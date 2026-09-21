import { type TimelineActivityTypeSnapshot } from 'twenty-shared/timeline';

import {
  buildTimelineActivityMergeKey,
  buildTimelineActivityMergeKeyCandidates,
} from 'src/modules/timeline/utils/build-timeline-activity-merge-key.util';

const buildSnapshot = (
  overrides: Partial<TimelineActivityTypeSnapshot> = {},
): TimelineActivityTypeSnapshot => ({
  id: '20202020-0000-4000-8000-000000000001',
  universalIdentifier: '20202020-0000-4000-8000-000000000002',
  name: 'recordUpdated',
  label: 'was updated by',
  action: 'updated',
  icon: 'IconPencil',
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
  ...overrides,
});

const buildKey = ({
  workspaceMemberId = '20202020-0000-4000-8000-000000000003',
  snapshot = buildSnapshot(),
}: {
  workspaceMemberId?: string | null;
  snapshot?: TimelineActivityTypeSnapshot;
} = {}) =>
  buildTimelineActivityMergeKey({
    recordId: '20202020-0000-4000-8000-000000000004',
    workspaceMemberId,
    timelineActivityTypeId: '20202020-0000-4000-8000-000000000001',
    timelineActivityTypeSnapshot: snapshot,
  });

describe('buildTimelineActivityMergeKey', () => {
  it('ignores live presentation values while preserving frozen semantics', () => {
    expect(
      buildKey({
        snapshot: buildSnapshot({
          name: 'renamed',
          label: 'has changed',
          icon: 'IconRefresh',
          frontComponentUniversalIdentifier:
            '20202020-0000-4000-8000-000000000005',
        }),
      }),
    ).toBe(buildKey());
  });

  it.each([
    { action: 'created' },
    {
      universalIdentifier: '20202020-0000-4000-8000-000000000006',
    },
    {
      objectUniversalIdentifier: '20202020-0000-4000-8000-000000000007',
    },
  ] satisfies Partial<TimelineActivityTypeSnapshot>[])(
    'keeps semantic snapshot fields in the frozen merge identity',
    (snapshotOverride) => {
      expect(buildKey({ snapshot: buildSnapshot(snapshotOverride) })).not.toBe(
        buildKey(),
      );
    },
  );

  it('normalizes an absent author', () => {
    expect(buildKey({ workspaceMemberId: null })).toBe(
      buildTimelineActivityMergeKey({
        recordId: '20202020-0000-4000-8000-000000000004',
        workspaceMemberId: undefined,
        timelineActivityTypeId: '20202020-0000-4000-8000-000000000001',
        timelineActivityTypeSnapshot: buildSnapshot(),
      }),
    );
  });

  it('falls back to the pre-snapshot identity during rolling upgrades', () => {
    const args = {
      recordId: '20202020-0000-4000-8000-000000000004',
      workspaceMemberId: '20202020-0000-4000-8000-000000000003',
      timelineActivityTypeId: '20202020-0000-4000-8000-000000000001',
      timelineActivityTypeSnapshot: buildSnapshot(),
    };

    expect(buildTimelineActivityMergeKeyCandidates(args)).toEqual([
      buildTimelineActivityMergeKey(args),
      buildTimelineActivityMergeKey({
        ...args,
        timelineActivityTypeSnapshot: null,
      }),
    ]);
  });
});

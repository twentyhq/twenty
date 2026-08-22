import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';
import { doesTimelineActivityJunctionLinkChange } from 'src/modules/timeline/utils/does-timeline-activity-junction-link-change.util';

const targetShape: Extract<
  TimelineActivityRuleTargetShape,
  { kind: 'JUNCTION' }
> = {
  kind: 'JUNCTION',
  junctionObjectMetadataId: 'junction-object-id',
  junctionObjectNameSingular: 'messageParticipant',
  junctionSourceJoinColumnName: 'messageId',
  junctionTargetJoinColumns: [
    { joinColumnName: 'personId', targetObjectNameSingular: 'person' },
    { joinColumnName: 'workspaceMemberId', targetObjectNameSingular: 'member' },
  ],
};

const buildEvent = (diff?: Record<string, unknown>) =>
  ({
    recordId: 'junction-record-id',
    properties: { diff },
  }) as ObjectRecordBaseEvent<Record<string, unknown>>;

describe('doesTimelineActivityJunctionLinkChange', () => {
  it.each(['messageId', 'personId', 'workspaceMemberId'])(
    'detects a change to the %s join column',
    (joinColumnName) => {
      expect(
        doesTimelineActivityJunctionLinkChange({
          event: buildEvent({
            [joinColumnName]: { before: null, after: 'id' },
          }),
          targetShape,
        }),
      ).toBe(true);
    },
  );

  it('ignores updates to non-link fields', () => {
    expect(
      doesTimelineActivityJunctionLinkChange({
        event: buildEvent({ handle: { before: 'old', after: 'new' } }),
        targetShape,
      }),
    ).toBe(false);
  });

  it('ignores updates without a diff', () => {
    expect(
      doesTimelineActivityJunctionLinkChange({
        event: buildEvent(),
        targetShape,
      }),
    ).toBe(false);
  });
});

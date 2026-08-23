import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';
import { resolveTimelineActivitySourceRuleAction } from 'src/modules/timeline/utils/resolve-timeline-activity-source-rule-action.util';

const DIRECT_RELATION_TARGET_SHAPE: TimelineActivityRuleTargetShape = {
  kind: 'DIRECT_RELATION',
  targetJoinColumns: [],
};

describe('resolveTimelineActivitySourceRuleAction', () => {
  const cases: {
    eventAction: DatabaseEventAction;
    declaredAction: TimelineActivityRuleAction;
    expectedAction: TimelineActivityRuleAction;
  }[] = [
    {
      eventAction: DatabaseEventAction.CREATED,
      declaredAction: 'linked',
      expectedAction: 'linked',
    },
    {
      eventAction: DatabaseEventAction.RESTORED,
      declaredAction: 'linked',
      expectedAction: 'linked',
    },
    {
      eventAction: DatabaseEventAction.DELETED,
      declaredAction: 'unlinked',
      expectedAction: 'unlinked',
    },
    {
      eventAction: DatabaseEventAction.UPDATED,
      declaredAction: 'linked',
      expectedAction: 'linked',
    },
    {
      eventAction: DatabaseEventAction.UPDATED,
      declaredAction: 'unlinked',
      expectedAction: 'unlinked',
    },
    {
      eventAction: DatabaseEventAction.UPDATED,
      declaredAction: 'updated',
      expectedAction: 'updated',
    },
    {
      eventAction: DatabaseEventAction.CREATED,
      declaredAction: 'created',
      expectedAction: 'created',
    },
  ];

  it.each(cases)(
    'maps $eventAction to $expectedAction for a direct $declaredAction rule',
    ({ eventAction, declaredAction, expectedAction }) => {
      expect(
        resolveTimelineActivitySourceRuleAction({
          actions: [declaredAction],
          targetShape: DIRECT_RELATION_TARGET_SHAPE,
          eventAction,
        }),
      ).toBe(expectedAction);
    },
  );

  it('does not derive link actions for non-direct source rules', () => {
    expect(
      resolveTimelineActivitySourceRuleAction({
        actions: ['linked'],
        targetShape: { kind: 'SELF' },
        eventAction: DatabaseEventAction.CREATED,
      }),
    ).toBeUndefined();
  });
});

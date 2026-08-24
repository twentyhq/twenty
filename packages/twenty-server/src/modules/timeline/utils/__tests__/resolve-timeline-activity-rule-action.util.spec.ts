import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRuleTargetShape } from 'src/modules/timeline/types/timeline-activity-rule-target-shape.type';
import { resolveTimelineActivityRuleAction } from 'src/modules/timeline/utils/resolve-timeline-activity-rule-action.util';

const DIRECT_RELATION_TARGET_SHAPE: TimelineActivityRuleTargetShape = {
  kind: 'DIRECT_RELATION',
  targetJoinColumns: [],
};

const JUNCTION_TARGET_SHAPE: TimelineActivityRuleTargetShape = {
  kind: 'JUNCTION',
  junctionObjectMetadataId: 'junction-object-id',
  junctionObjectNameSingular: 'junctionObject',
  junctionSourceJoinColumnName: 'sourceId',
  targetJoinColumns: [],
};

describe('resolveTimelineActivityRuleAction', () => {
  const sourceCases: {
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

  it.each(sourceCases)(
    'maps $eventAction to $expectedAction for a direct $declaredAction rule',
    ({ eventAction, declaredAction, expectedAction }) => {
      expect(
        resolveTimelineActivityRuleAction({
          actions: [declaredAction],
          targetShape: DIRECT_RELATION_TARGET_SHAPE,
          eventAction,
          eventSource: 'SOURCE',
        }),
      ).toBe(expectedAction);
    },
  );

  it.each([
    {
      eventAction: DatabaseEventAction.CREATED,
      declaredAction: 'linked' as const,
    },
    {
      eventAction: DatabaseEventAction.RESTORED,
      declaredAction: 'linked' as const,
    },
    {
      eventAction: DatabaseEventAction.DELETED,
      declaredAction: 'unlinked' as const,
    },
    {
      eventAction: DatabaseEventAction.UPDATED,
      declaredAction: 'linked' as const,
    },
    {
      eventAction: DatabaseEventAction.UPDATED,
      declaredAction: 'unlinked' as const,
    },
  ])(
    'maps a junction $eventAction to $declaredAction',
    ({ eventAction, declaredAction }) => {
      expect(
        resolveTimelineActivityRuleAction({
          actions: [declaredAction],
          targetShape: JUNCTION_TARGET_SHAPE,
          eventAction,
          eventSource: 'JUNCTION',
        }),
      ).toBe(declaredAction);
    },
  );

  it('does not treat a junction-row update as a source-record update', () => {
    expect(
      resolveTimelineActivityRuleAction({
        actions: ['updated'],
        targetShape: JUNCTION_TARGET_SHAPE,
        eventAction: DatabaseEventAction.UPDATED,
        eventSource: 'JUNCTION',
      }),
    ).toBeUndefined();
  });

  it('does not derive link actions for self rules', () => {
    expect(
      resolveTimelineActivityRuleAction({
        actions: ['linked'],
        targetShape: { kind: 'SELF' },
        eventAction: DatabaseEventAction.CREATED,
        eventSource: 'SOURCE',
      }),
    ).toBeUndefined();
  });
});

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-type-definitions.constant';
import { resolveTimelineActivityTypeRouting } from 'src/modules/timeline/utils/resolve-timeline-activity-type-routing.util';
import { type ResolvableTimelineActivityType } from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

const noteUpdatedDefinition = STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS.find(
  ({ name }) => name === 'noteUpdated',
);
const messageLinkedDefinition =
  STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS.find(
    ({ name }) => name === 'messageLinked',
  );

if (!noteUpdatedDefinition || !messageLinkedDefinition) {
  throw new Error('Missing standard timeline activity type definitions');
}

const timelineActivityType = {
  universalIdentifier: noteUpdatedDefinition.universalIdentifier,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  targetRelationFieldUniversalIdentifier: null,
  triggerFieldUniversalIdentifiers: null,
  happensAtFieldUniversalIdentifier: null,
} as ResolvableTimelineActivityType;

describe('resolveTimelineActivityTypeRouting', () => {
  it('uses frozen standard routing while a workspace is still upgrading', () => {
    expect(resolveTimelineActivityTypeRouting(timelineActivityType)).toEqual({
      targetRelationFieldUniversalIdentifier:
        noteUpdatedDefinition.targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers:
        noteUpdatedDefinition.triggerFieldUniversalIdentifiers,
      happensAtFieldUniversalIdentifier: null,
    });
  });

  it('does not grant the standard compatibility fallback to applications', () => {
    expect(
      resolveTimelineActivityTypeRouting({
        ...timelineActivityType,
        applicationUniversalIdentifier: '00000000-0000-4000-8000-000000000001',
      }),
    ).toBeUndefined();
  });

  it('prefers synced routing once the workspace command has run', () => {
    expect(
      resolveTimelineActivityTypeRouting({
        ...timelineActivityType,
        targetRelationFieldUniversalIdentifier:
          '00000000-0000-4000-8000-000000000002',
        triggerFieldUniversalIdentifiers: [
          '00000000-0000-4000-8000-000000000003',
        ],
      }),
    ).toEqual({
      targetRelationFieldUniversalIdentifier:
        '00000000-0000-4000-8000-000000000002',
      triggerFieldUniversalIdentifiers: [
        '00000000-0000-4000-8000-000000000003',
      ],
      happensAtFieldUniversalIdentifier: null,
    });
  });

  it('uses the frozen standard happensAt field while a workspace is still upgrading', () => {
    expect(
      resolveTimelineActivityTypeRouting({
        ...timelineActivityType,
        universalIdentifier: messageLinkedDefinition.universalIdentifier,
      }),
    ).toEqual({
      targetRelationFieldUniversalIdentifier:
        messageLinkedDefinition.targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers: null,
      happensAtFieldUniversalIdentifier:
        STANDARD_OBJECTS.message.fields.receivedAt.universalIdentifier,
    });
  });

  it('prefers the synced happensAt field once the workspace command has run', () => {
    expect(
      resolveTimelineActivityTypeRouting({
        ...timelineActivityType,
        universalIdentifier: messageLinkedDefinition.universalIdentifier,
        targetRelationFieldUniversalIdentifier:
          messageLinkedDefinition.targetRelationFieldUniversalIdentifier ??
          null,
        happensAtFieldUniversalIdentifier:
          '00000000-0000-4000-8000-000000000004',
      }),
    ).toEqual({
      targetRelationFieldUniversalIdentifier:
        messageLinkedDefinition.targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers: null,
      happensAtFieldUniversalIdentifier: '00000000-0000-4000-8000-000000000004',
    });
  });

  it('does not grant the standard happensAt fallback to applications', () => {
    expect(
      resolveTimelineActivityTypeRouting({
        ...timelineActivityType,
        universalIdentifier: messageLinkedDefinition.universalIdentifier,
        applicationUniversalIdentifier: '00000000-0000-4000-8000-000000000001',
        targetRelationFieldUniversalIdentifier:
          messageLinkedDefinition.targetRelationFieldUniversalIdentifier ??
          null,
      }),
    ).toEqual({
      targetRelationFieldUniversalIdentifier:
        messageLinkedDefinition.targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers: null,
      happensAtFieldUniversalIdentifier: null,
    });
  });
});

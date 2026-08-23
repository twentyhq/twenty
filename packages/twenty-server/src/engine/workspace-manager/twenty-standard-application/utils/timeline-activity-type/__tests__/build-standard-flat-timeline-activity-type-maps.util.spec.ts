import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { buildStandardFlatTimelineActivityTypeMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/timeline-activity-type/build-standard-flat-timeline-activity-type-maps.util';

const getTimelineActivityTypeOrThrow = (
  flatTimelineActivityTypeMaps: FlatEntityMaps<FlatTimelineActivityType>,
  name: string,
) => {
  const timelineActivityType = Object.values(
    flatTimelineActivityTypeMaps.byUniversalIdentifier,
  ).find((type) => type?.name === name);

  if (!isDefined(timelineActivityType)) {
    throw new Error(`Timeline activity type ${name} not found`);
  }

  return timelineActivityType;
};

const buildMaps = (
  hiddenTimelineActivityTypeColumnPropertyNames: ReadonlySet<string>,
) =>
  buildStandardFlatTimelineActivityTypeMaps({
    now: '2026-08-22T00:00:00.000Z',
    workspaceId: '20202020-0000-4000-8000-000000000001',
    twentyStandardApplicationId: '20202020-0000-4000-8000-000000000002',
    hiddenTimelineActivityTypeColumnPropertyNames,
  });

describe('buildStandardFlatTimelineActivityTypeMaps', () => {
  it('should omit routing properties before their upgrade command is applied', () => {
    const maps = buildMaps(
      new Set([
        'targetRelationFieldUniversalIdentifier',
        'triggerFieldUniversalIdentifiers',
      ]),
    );

    expect(
      getTimelineActivityTypeOrThrow(maps, 'messageLinked')
        .targetRelationFieldUniversalIdentifier,
    ).toBeNull();
    expect(
      getTimelineActivityTypeOrThrow(maps, 'noteUpdated')
        .triggerFieldUniversalIdentifiers,
    ).toBeNull();
  });

  it('should include routing properties after their upgrade command is applied', () => {
    const maps = buildMaps(new Set());

    expect(
      getTimelineActivityTypeOrThrow(maps, 'messageLinked')
        .targetRelationFieldUniversalIdentifier,
    ).toBe(
      STANDARD_OBJECTS.message.fields.messageParticipants.universalIdentifier,
    );
    expect(
      getTimelineActivityTypeOrThrow(maps, 'noteUpdated')
        .triggerFieldUniversalIdentifiers,
    ).toEqual([STANDARD_OBJECTS.note.fields.title.universalIdentifier]);
    expect(
      getTimelineActivityTypeOrThrow(maps, 'messageLinked')
        .frontComponentUniversalIdentifier,
    ).toBe(STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS.message);
    expect(
      getTimelineActivityTypeOrThrow(maps, 'attachmentLinked')
        .targetRelationFieldUniversalIdentifier,
    ).toBe(STANDARD_OBJECTS.attachment.fields.targetPerson.universalIdentifier);
  });
});

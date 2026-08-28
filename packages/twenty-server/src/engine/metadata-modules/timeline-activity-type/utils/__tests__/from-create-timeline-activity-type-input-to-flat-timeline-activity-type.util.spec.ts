import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { TimelineActivityTypeException } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.exception';
import { fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow } from 'src/engine/metadata-modules/timeline-activity-type/utils/from-create-timeline-activity-type-input-to-flat-timeline-activity-type-or-throw.util';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const CUSTOM_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000cc';

const RELATION_FIELD = {
  id: '20202020-0000-0000-0000-000000000010',
  universalIdentifier: '20202020-0000-0000-0000-000000000011',
  name: 'activityTargets',
  objectMetadataId: '20202020-0000-0000-0000-000000000020',
};

const CUSTOM_OBJECT = {
  id: '20202020-0000-0000-0000-000000000020',
  universalIdentifier: '20202020-0000-0000-0000-000000000021',
  applicationUniversalIdentifier: CUSTOM_APPLICATION.universalIdentifier,
};

const buildFlatEntityMaps = <TFlatEntityMaps>(
  flatEntities: ({ id: string; universalIdentifier: string } & Record<
    string,
    unknown
  >)[],
): TFlatEntityMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.id,
        flatEntity.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as TFlatEntityMaps;

const buildArgs = ({
  objectApplicationUniversalIdentifier = CUSTOM_APPLICATION.universalIdentifier,
  existingTimelineActivityTypes = [] as {
    id: string;
    universalIdentifier: string;
    action: string | null;
    targetRelationFieldUniversalIdentifier: string | null;
  }[],
} = {}) => ({
  flatFieldMetadataMaps: buildFlatEntityMaps<FlatEntityMaps<FlatFieldMetadata>>(
    [RELATION_FIELD],
  ),
  flatObjectMetadataMaps: buildFlatEntityMaps<
    FlatEntityMaps<FlatObjectMetadata>
  >([
    {
      ...CUSTOM_OBJECT,
      applicationUniversalIdentifier: objectApplicationUniversalIdentifier,
    },
  ]),
  flatTimelineActivityTypeMaps:
    buildFlatEntityMaps<FlatTimelineActivityTypeMaps>(
      existingTimelineActivityTypes,
    ),
  workspaceCustomFlatApplication: CUSTOM_APPLICATION,
  workspaceId: WORKSPACE_ID,
  now: '2026-01-01T00:00:00.000Z',
});

describe('fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow', () => {
  it('builds a linked emitter owned by the workspace custom application', () => {
    const flatTimelineActivityType =
      fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow({
        createTimelineActivityTypeInput: {
          label: 'added an activity',
          icon: 'IconActivity',
          targetRelationFieldMetadataId: RELATION_FIELD.id,
        },
        ...buildArgs(),
      });

    expect(flatTimelineActivityType).toMatchObject({
      name: 'activityTargetsLinked',
      label: 'added an activity',
      action: 'linked',
      icon: 'IconActivity',
      objectUniversalIdentifier: CUSTOM_OBJECT.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        RELATION_FIELD.universalIdentifier,
      applicationId: CUSTOM_APPLICATION.id,
      applicationUniversalIdentifier: CUSTOM_APPLICATION.universalIdentifier,
      workspaceId: WORKSPACE_ID,
      isActive: true,
      overrides: null,
      frontComponentUniversalIdentifier: null,
      replacesTimelineActivityTypeUniversalIdentifier: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('throws when the relation field does not exist', () => {
    expect(() =>
      fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow({
        createTimelineActivityTypeInput: {
          label: 'added an activity',
          targetRelationFieldMetadataId: '20202020-0000-0000-0000-0000000000ff',
        },
        ...buildArgs(),
      }),
    ).toThrow(TimelineActivityTypeException);
  });

  it('throws when the relation belongs to another application object', () => {
    expect(() =>
      fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow({
        createTimelineActivityTypeInput: {
          label: 'added an activity',
          targetRelationFieldMetadataId: RELATION_FIELD.id,
        },
        ...buildArgs({
          objectApplicationUniversalIdentifier:
            STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      }),
    ).toThrow(TimelineActivityTypeException);
  });

  it('throws when a type already emits on this relation slot', () => {
    expect.assertions(1);

    try {
      fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow({
        createTimelineActivityTypeInput: {
          label: 'added an activity',
          targetRelationFieldMetadataId: RELATION_FIELD.id,
        },
        ...buildArgs({
          existingTimelineActivityTypes: [
            {
              id: '20202020-0000-0000-0000-000000000030',
              universalIdentifier: '20202020-0000-0000-0000-000000000031',
              action: 'linked',
              targetRelationFieldUniversalIdentifier:
                RELATION_FIELD.universalIdentifier,
            },
          ],
        }),
      });
    } catch (error) {
      expect((error as TimelineActivityTypeException).code).toBe(
        TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS,
      );
    }
  });
});

import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
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

const CUSTOM_OBJECT = {
  id: '20202020-0000-0000-0000-000000000020',
  universalIdentifier: '20202020-0000-0000-0000-000000000021',
  nameSingular: 'partner',
};

// Another custom object of the same application, carrying a relation field of
// the same name, to pin that generated names stay distinct.
const OTHER_CUSTOM_OBJECT = {
  id: '20202020-0000-0000-0000-000000000022',
  universalIdentifier: '20202020-0000-0000-0000-000000000023',
  nameSingular: 'vendor',
};

const RELATION_FIELD = {
  id: '20202020-0000-0000-0000-000000000010',
  universalIdentifier: '20202020-0000-0000-0000-000000000011',
  name: 'activityTargets',
  objectMetadataId: CUSTOM_OBJECT.id,
};

const OTHER_RELATION_FIELD = {
  id: '20202020-0000-0000-0000-000000000012',
  universalIdentifier: '20202020-0000-0000-0000-000000000013',
  name: 'activityTargets',
  objectMetadataId: OTHER_CUSTOM_OBJECT.id,
};

const buildFlatEntityMaps = <
  T extends FlatFieldMetadata | FlatObjectMetadata | FlatTimelineActivityType,
>(
  flatEntities: T[],
): FlatEntityMaps<T> =>
  flatEntities.reduce<FlatEntityMaps<T>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildRelationFlatFieldMetadata = (
  relationField: typeof RELATION_FIELD,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    ...relationField,
    type: FieldMetadataType.RELATION,
  });

const buildFlatObjectMetadata = ({
  customObject,
  applicationUniversalIdentifier = CUSTOM_APPLICATION.universalIdentifier,
}: {
  customObject: typeof CUSTOM_OBJECT;
  applicationUniversalIdentifier?: string;
}): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    ...customObject,
    applicationUniversalIdentifier,
  });

const buildArgs = ({
  objectApplicationUniversalIdentifier = CUSTOM_APPLICATION.universalIdentifier,
  existingTimelineActivityTypes = [],
}: {
  objectApplicationUniversalIdentifier?: string;
  existingTimelineActivityTypes?: FlatTimelineActivityType[];
} = {}) => ({
  flatFieldMetadataMaps: buildFlatEntityMaps([
    buildRelationFlatFieldMetadata(RELATION_FIELD),
    buildRelationFlatFieldMetadata(OTHER_RELATION_FIELD),
  ]),
  flatObjectMetadataMaps: buildFlatEntityMaps([
    buildFlatObjectMetadata({
      customObject: CUSTOM_OBJECT,
      applicationUniversalIdentifier: objectApplicationUniversalIdentifier,
    }),
    buildFlatObjectMetadata({ customObject: OTHER_CUSTOM_OBJECT }),
  ]),
  flatTimelineActivityTypeMaps: buildFlatEntityMaps(
    existingTimelineActivityTypes,
  ),
  workspaceCustomFlatApplication: CUSTOM_APPLICATION,
  workspaceId: WORKSPACE_ID,
  now: '2026-01-01T00:00:00.000Z',
});

// The emitter already occupying a slot is built by the util itself, so the
// fixture cannot drift from the shape the code under test produces.
const buildLinkedEmitter = (
  targetRelationFieldMetadataId: string,
): FlatTimelineActivityType =>
  fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow({
    createTimelineActivityTypeInput: {
      label: 'added an activity',
      targetRelationFieldMetadataId,
    },
    ...buildArgs(),
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
      name: 'partnerActivityTargetsLinked',
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
      happensAtFieldUniversalIdentifier: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('names emitters per object so two objects can share a relation field name', () => {
    const buildName = (targetRelationFieldMetadataId: string) =>
      fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow({
        createTimelineActivityTypeInput: {
          label: 'added an activity',
          targetRelationFieldMetadataId,
        },
        ...buildArgs(),
      }).name;

    expect(buildName(RELATION_FIELD.id)).toBe('partnerActivityTargetsLinked');
    expect(buildName(OTHER_RELATION_FIELD.id)).toBe(
      'vendorActivityTargetsLinked',
    );
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
              ...buildLinkedEmitter(RELATION_FIELD.id),
              id: '20202020-0000-0000-0000-000000000030',
              universalIdentifier: '20202020-0000-0000-0000-000000000031',
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

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { fromFlatTimelineActivityTypeToTimelineActivityTypeDto } from 'src/engine/metadata-modules/timeline-activity-type/utils/from-flat-timeline-activity-type-to-timeline-activity-type-dto.util';
import { fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow } from 'src/engine/metadata-modules/timeline-activity-type/utils/from-update-timeline-activity-type-input-to-flat-timeline-activity-type-to-update-or-throw.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

const timelineActivityType: FlatTimelineActivityType = {
  id: '00000000-0000-4000-8000-000000000003',
  universalIdentifier: '00000000-0000-4000-8000-000000000004',
  workspaceId: '00000000-0000-4000-8000-000000000005',
  applicationId: '00000000-0000-4000-8000-000000000006',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'record.created',
  label: 'was created by',
  action: 'created',
  icon: 'IconPlus',
  frontComponentUniversalIdentifier: null,
  objectUniversalIdentifier: null,
  targetRelationFieldUniversalIdentifier: null,
  triggerFieldUniversalIdentifiers: null,
  replacesTimelineActivityTypeUniversalIdentifier: null,
  isActive: true,
  overrides: null,
  createdAt: '2026-08-22T00:00:00.000Z',
  updatedAt: '2026-08-22T00:00:00.000Z',
};

const flatTimelineActivityTypeMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: timelineActivityType,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

describe('fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow', () => {
  it('stores presentation changes as workspace overrides and mutes the type', () => {
    const result =
      fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow(
        {
          flatTimelineActivityTypeMaps,
          updateTimelineActivityTypeInput: {
            id: timelineActivityType.id,
            label: 'was added by',
            icon: 'IconSparkles',
            isActive: false,
          },
          callerApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceCustomApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      );

    expect(result).toMatchObject({
      label: 'was created by',
      icon: 'IconPlus',
      isActive: false,
      overrides: { label: 'was added by', icon: 'IconSparkles' },
    });
    expect(
      fromFlatTimelineActivityTypeToTimelineActivityTypeDto(result),
    ).toMatchObject({
      label: 'was added by',
      icon: 'IconSparkles',
      isActive: false,
      emit: {
        on: 'created',
        objectUniversalIdentifier: null,
        through: null,
      },
    });
  });

  it('updates presentation directly for a type owned by the caller', () => {
    const result =
      fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow(
        {
          flatTimelineActivityTypeMaps,
          updateTimelineActivityTypeInput: {
            id: timelineActivityType.id,
            label: 'was added by',
          },
          callerApplicationUniversalIdentifier:
            APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceCustomApplicationUniversalIdentifier:
            APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      );

    expect(result).toMatchObject({
      label: 'was added by',
      overrides: null,
    });
  });

  it('stores translated labels in the workspace override', () => {
    const result =
      fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow(
        {
          flatTimelineActivityTypeMaps,
          updateTimelineActivityTypeInput: {
            id: timelineActivityType.id,
            translations: [
              { locale: 'fr-FR', property: 'label', value: 'a été créé par' },
            ],
          },
          callerApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceCustomApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      );

    expect(result.overrides).toEqual({
      translations: { 'fr-FR': { label: 'a été créé par' } },
    });
  });

  it('rejects translations for non-translatable properties', () => {
    expect(() =>
      fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow(
        {
          flatTimelineActivityTypeMaps,
          updateTimelineActivityTypeInput: {
            id: timelineActivityType.id,
            translations: [
              { locale: 'fr-FR', property: 'icon', value: 'IconPlus' },
            ],
          },
          callerApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceCustomApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ),
    ).toThrow('Cannot translate timeline activity type properties: icon');
  });
});

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type UpdateTimelineActivityTypeInput } from 'src/engine/metadata-modules/timeline-activity-type/dtos/update-timeline-activity-type.input';
import { type TimelineActivityTypeOverrides } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { TimelineActivityTypeException } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.exception';
import { findInvalidTranslationOverrideProperties } from 'src/engine/metadata-modules/utils/find-invalid-translation-override-properties.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { mergeTranslationsIntoOverrides } from 'src/engine/metadata-modules/utils/merge-translations-into-overrides.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

const WORKSPACE_EDITABLE_TIMELINE_ACTIVITY_TYPE_PROPERTIES = [
  'label',
  'icon',
  'isActive',
] as const;

export const fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow =
  ({
    flatTimelineActivityTypeMaps,
    updateTimelineActivityTypeInput,
    callerApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    flatTimelineActivityTypeMaps: FlatTimelineActivityTypeMaps;
    updateTimelineActivityTypeInput: UpdateTimelineActivityTypeInput;
    callerApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): FlatTimelineActivityType => {
    const existingFlatTimelineActivityType = findFlatEntityByIdInFlatEntityMaps(
      {
        flatEntityId: updateTimelineActivityTypeInput.id,
        flatEntityMaps: flatTimelineActivityTypeMaps,
      },
    );

    if (!isDefined(existingFlatTimelineActivityType)) {
      throw new TimelineActivityTypeException(
        'Timeline activity type not found',
        TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NOT_FOUND,
      );
    }

    const {
      id: _id,
      translations = [],
      ...updates
    } = updateTimelineActivityTypeInput;
    const invalidTranslationProperties =
      findInvalidTranslationOverrideProperties(
        translations,
        'timelineActivityType',
      );

    if (isNonEmptyArray(invalidTranslationProperties)) {
      throw new TimelineActivityTypeException(
        `Cannot translate timeline activity type properties: ${invalidTranslationProperties.join(', ')}`,
        TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      );
    }

    const shouldOverride = isCallerOverridingEntity({
      callerApplicationUniversalIdentifier,
      entityApplicationUniversalIdentifier:
        existingFlatTimelineActivityType.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
      isSystemSideEffect: false,
    });
    const { overrides, updatedEditableProperties } =
      sanitizeOverridableEntityInput({
        metadataName: 'timelineActivityType',
        existingFlatEntity: existingFlatTimelineActivityType,
        updatedEditableProperties: updates,
        shouldOverride,
      });

    return {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatTimelineActivityType,
        properties: [...WORKSPACE_EDITABLE_TIMELINE_ACTIVITY_TYPE_PROPERTIES],
        update: updatedEditableProperties,
      }),
      overrides: mergeTranslationsIntoOverrides<TimelineActivityTypeOverrides>({
        existingOverrides: overrides,
        translationEntries: translations,
      }),
      updatedAt: new Date().toISOString(),
    };
  };

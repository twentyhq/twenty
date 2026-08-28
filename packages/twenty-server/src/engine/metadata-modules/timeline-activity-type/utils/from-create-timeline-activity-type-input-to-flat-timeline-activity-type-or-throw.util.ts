import { msg } from '@lingui/core/macro';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { type CreateTimelineActivityTypeInput } from 'src/engine/metadata-modules/timeline-activity-type/dtos/create-timeline-activity-type.input';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { TimelineActivityTypeException } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.exception';

const RELATION_TIMELINE_ACTIVITY_TYPE_ACTION: TimelineActivityAction = 'linked';

export const fromCreateTimelineActivityTypeInputToFlatTimelineActivityTypeOrThrow =
  ({
    createTimelineActivityTypeInput,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatTimelineActivityTypeMaps,
    workspaceCustomFlatApplication,
    workspaceId,
    now = new Date().toISOString(),
  }: {
    createTimelineActivityTypeInput: CreateTimelineActivityTypeInput;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatTimelineActivityTypeMaps: FlatTimelineActivityTypeMaps;
    workspaceCustomFlatApplication: {
      id: string;
      universalIdentifier: string;
    };
    workspaceId: string;
    now?: string;
  }): FlatTimelineActivityType => {
    const { label, icon = null, targetRelationFieldMetadataId } =
      createTimelineActivityTypeInput;
    const action = RELATION_TIMELINE_ACTIVITY_TYPE_ACTION;

    const targetRelationFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetRelationFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(targetRelationFlatFieldMetadata)) {
      throw new TimelineActivityTypeException(
        'Target relation field not found',
        TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        { userFriendlyMessage: msg`The selected relation is not available` },
      );
    }

    const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetRelationFlatFieldMetadata.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(sourceFlatObjectMetadata)) {
      throw new TimelineActivityTypeException(
        'Target relation field object not found',
        TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        { userFriendlyMessage: msg`The selected relation is not available` },
      );
    }

    // An emitter on another application's object must override that app's own
    // type; that flow stays in the application settings.
    if (
      sourceFlatObjectMetadata.applicationUniversalIdentifier !==
      workspaceCustomFlatApplication.universalIdentifier
    ) {
      throw new TimelineActivityTypeException(
        'Timeline activity types can only be created for relations on workspace custom objects',
        TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        {
          userFriendlyMessage: msg`Timeline logging can only be enabled on relations of custom objects`,
        },
      );
    }

    // Names are unique per application and every custom object shares the
    // workspace custom application, so the source object has to be part of the
    // name: two objects can each hold a relation field of the same name.
    const name = `${sourceFlatObjectMetadata.nameSingular}${capitalize(targetRelationFlatFieldMetadata.name)}${capitalize(action)}`;

    const conflictingFlatTimelineActivityType = Object.values(
      flatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).find(
      (existingFlatTimelineActivityType) =>
        isDefined(existingFlatTimelineActivityType) &&
        existingFlatTimelineActivityType.action === action &&
        existingFlatTimelineActivityType.targetRelationFieldUniversalIdentifier ===
          targetRelationFlatFieldMetadata.universalIdentifier,
    );

    if (isDefined(conflictingFlatTimelineActivityType)) {
      throw new TimelineActivityTypeException(
        `A timeline activity type already emits on ${action} for this relation`,
        TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS,
        {
          userFriendlyMessage: msg`A timeline activity type already exists for this relation`,
        },
      );
    }

    return {
      id: v4(),
      name,
      label,
      action,
      icon,
      frontComponentUniversalIdentifier: null,
      objectUniversalIdentifier: sourceFlatObjectMetadata.universalIdentifier,
      targetRelationFieldUniversalIdentifier:
        targetRelationFlatFieldMetadata.universalIdentifier,
      triggerFieldUniversalIdentifiers: null,
      replacesTimelineActivityTypeUniversalIdentifier: null,
      isActive: true,
      overrides: null,
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
      universalIdentifier: v4(),
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  };

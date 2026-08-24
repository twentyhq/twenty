import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import {
  isStandardTimelineActivityRendererUniversalIdentifier,
  isTimelineActivityAction,
} from 'twenty-shared/timeline';
import { RelationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { isValidTimelineActivityTypeOverride } from 'src/engine/metadata-modules/timeline-activity-type/utils/is-valid-timeline-activity-type-override.util';
import { resolveTimelineActivityTypeOverride } from 'src/engine/metadata-modules/timeline-activity-type/utils/resolve-timeline-activity-type-override.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type UniversalFlatTimelineActivityType } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-timeline-activity-type.type';

type TimelineActivityTypeValidationMaps =
  MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'timelineActivityType'>;

type TimelineActivityTypeValidationResult = FailedFlatEntityValidation<
  'timelineActivityType',
  'create' | 'update'
>;

@Injectable()
export class FlatTimelineActivityTypeValidatorService {
  public validateFlatTimelineActivityTypeCreation({
    flatEntityToValidate: flatTimelineActivityType,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: validationMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.timelineActivityType
  >): FailedFlatEntityValidation<'timelineActivityType', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatTimelineActivityType.universalIdentifier,
        name: flatTimelineActivityType.name,
      },
      metadataName: 'timelineActivityType',
      type: 'create',
    });
    this.validateTimelineActivityTypeConfiguration({
      timelineActivityType: flatTimelineActivityType,
      validationMaps,
      validationResult,
    });

    return validationResult;
  }

  public validateFlatTimelineActivityTypeDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.timelineActivityType
  >): FailedFlatEntityValidation<'timelineActivityType', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'timelineActivityType',
      type: 'delete',
    });

    const existingTimelineActivityType = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatTimelineActivityTypeMaps,
    });

    if (!isDefined(existingTimelineActivityType)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NOT_FOUND,
        message: t`Timeline activity type not found`,
        userFriendlyMessage: msg`Timeline activity type not found`,
      });
    }

    return validationResult;
  }

  public validateFlatTimelineActivityTypeUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.timelineActivityType
  >): FailedFlatEntityValidation<'timelineActivityType', 'update'> {
    const {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'timelineActivityType',
      type: 'update',
    });

    const fromFlatTimelineActivityType = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatTimelineActivityTypeMaps,
    });

    if (!isDefined(fromFlatTimelineActivityType)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NOT_FOUND,
        message: t`Timeline activity type not found`,
        userFriendlyMessage: msg`Timeline activity type not found`,
      });
      return validationResult;
    }

    const updatedTimelineActivityType = {
      ...fromFlatTimelineActivityType,
      ...flatEntityUpdate,
    };

    this.validateTimelineActivityTypeConfiguration({
      timelineActivityType: updatedTimelineActivityType,
      validationMaps: optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      validationResult,
    });

    return validationResult;
  }

  private validateTimelineActivityTypeConfiguration({
    timelineActivityType,
    validationMaps,
    validationResult,
  }: {
    timelineActivityType: UniversalFlatTimelineActivityType;
    validationMaps: TimelineActivityTypeValidationMaps;
    validationResult: TimelineActivityTypeValidationResult;
  }): void {
    if (!isNonEmptyString(timelineActivityType.name)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type name is required`,
        userFriendlyMessage: msg`Timeline activity type name is required`,
      });
    }

    if (!isNonEmptyString(timelineActivityType.label)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type label is required`,
        userFriendlyMessage: msg`Timeline activity type label is required`,
      });
    }

    if (
      isDefined(timelineActivityType.action) &&
      !isTimelineActivityAction(timelineActivityType.action)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Unknown timeline activity action ${timelineActivityType.action}`,
        userFriendlyMessage: msg`This timeline activity action is not supported`,
      });
    }

    const existingByName = Object.values(
      validationMaps.flatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).find(
      (existing) =>
        isDefined(existing) &&
        existing.universalIdentifier !==
          timelineActivityType.universalIdentifier &&
        existing.name === timelineActivityType.name &&
        existing.applicationUniversalIdentifier ===
          timelineActivityType.applicationUniversalIdentifier,
    );

    if (isDefined(existingByName)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS,
        message: t`Timeline activity type with name ${timelineActivityType.name} already exists for this application`,
        userFriendlyMessage: msg`A timeline activity type with this name already exists for this application`,
      });
    }

    this.validateTimelineActivityTypeDependencies({
      timelineActivityType,
      validationMaps,
      validationResult,
    });
    this.validateTimelineActivityTypeResolverConflict({
      timelineActivityType,
      validationMaps,
      validationResult,
    });
  }

  private validateTimelineActivityTypeDependencies({
    timelineActivityType,
    validationMaps,
    validationResult,
  }: {
    timelineActivityType: UniversalFlatTimelineActivityType;
    validationMaps: TimelineActivityTypeValidationMaps;
    validationResult: TimelineActivityTypeValidationResult;
  }): void {
    const {
      objectUniversalIdentifier,
      frontComponentUniversalIdentifier,
      targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers,
      replacesTimelineActivityTypeUniversalIdentifier,
    } = timelineActivityType;

    const objectMetadata = isDefined(objectUniversalIdentifier)
      ? validationMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          objectUniversalIdentifier
        ]
      : undefined;

    if (isDefined(objectUniversalIdentifier) && !isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type references an object that does not exist`,
        userFriendlyMessage: msg`The object used by this timeline activity type is not available`,
      });
    }

    if (
      isDefined(timelineActivityType.action) &&
      !isDefined(objectUniversalIdentifier) &&
      timelineActivityType.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION.universalIdentifier
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`An application timeline activity emitter must target one of its objects`,
        userFriendlyMessage: msg`Choose the object that emits this timeline activity type`,
      });
    }

    if (
      (timelineActivityType.action === 'linked' ||
        timelineActivityType.action === 'unlinked') &&
      !isDefined(targetRelationFieldUniversalIdentifier) &&
      timelineActivityType.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION.universalIdentifier
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Linked and unlinked timeline activity emitters require a target relation`,
        userFriendlyMessage: msg`Choose the relation used by this timeline activity type`,
      });
    }

    const overridesTimelineActivityType = isDefined(
      replacesTimelineActivityTypeUniversalIdentifier,
    )
      ? validationMaps.flatTimelineActivityTypeMaps.byUniversalIdentifier[
          replacesTimelineActivityTypeUniversalIdentifier
        ]
      : undefined;

    const targetsAnotherApplication =
      isDefined(timelineActivityType.action) &&
      isDefined(objectMetadata) &&
      objectMetadata.applicationUniversalIdentifier !==
        timelineActivityType.applicationUniversalIdentifier;

    if (
      targetsAnotherApplication &&
      !isDefined(replacesTimelineActivityTypeUniversalIdentifier)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`A timeline activity type targeting another application's object must declare the timeline activity type it overrides`,
        userFriendlyMessage: msg`Choose an existing timeline activity type to override`,
      });
    }

    if (
      isDefined(replacesTimelineActivityTypeUniversalIdentifier) &&
      !isValidTimelineActivityTypeOverride({
        timelineActivityType,
        objectOwner: objectMetadata,
        overriddenTimelineActivityType: overridesTimelineActivityType,
      })
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type override must reference a compatible type owned by the target object's application`,
        userFriendlyMessage: msg`The timeline activity type override is not compatible with this event`,
      });
    }

    if (isDefined(targetRelationFieldUniversalIdentifier)) {
      const targetRelationField =
        validationMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          targetRelationFieldUniversalIdentifier
        ];
      const hasSupportedRelationShape =
        isDefined(targetRelationField) &&
        isMorphOrRelationUniversalFlatFieldMetadata(targetRelationField) &&
        (targetRelationField.universalSettings?.relationType ===
          RelationType.MANY_TO_ONE ||
          (targetRelationField.universalSettings?.relationType ===
            RelationType.ONE_TO_MANY &&
            isDefined(
              targetRelationField.universalSettings
                ?.junctionTargetFieldUniversalIdentifier,
            )));

      if (
        !isDefined(timelineActivityType.action) ||
        !isDefined(objectUniversalIdentifier) ||
        !isDefined(targetRelationField) ||
        targetRelationField.objectMetadataUniversalIdentifier !==
          objectUniversalIdentifier ||
        !hasSupportedRelationShape
      ) {
        validationResult.errors.push({
          code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
          message: t`Timeline activity type target relation must be a direct or junction relation on its source object`,
          userFriendlyMessage: msg`The target relation used by this timeline activity type is not available`,
        });
      }
    }

    if (isDefined(triggerFieldUniversalIdentifiers)) {
      const hasInvalidTriggerField =
        timelineActivityType.action !== 'updated' ||
        !isDefined(targetRelationFieldUniversalIdentifier) ||
        !isNonEmptyArray(triggerFieldUniversalIdentifiers) ||
        new Set(triggerFieldUniversalIdentifiers).size !==
          triggerFieldUniversalIdentifiers.length ||
        triggerFieldUniversalIdentifiers.some((universalIdentifier) => {
          const triggerField =
            validationMaps.flatFieldMetadataMaps.byUniversalIdentifier[
              universalIdentifier
            ];

          return (
            !isDefined(triggerField) ||
            triggerField.objectMetadataUniversalIdentifier !==
              objectUniversalIdentifier
          );
        });

      if (hasInvalidTriggerField) {
        validationResult.errors.push({
          code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
          message: t`Timeline activity type trigger fields must be non-empty fields on the source object of an updated relation event`,
          userFriendlyMessage: msg`The trigger fields used by this timeline activity type are not available`,
        });
      }
    }

    if (!isDefined(frontComponentUniversalIdentifier)) {
      return;
    }

    const isStandardRenderer =
      isStandardTimelineActivityRendererUniversalIdentifier(
        frontComponentUniversalIdentifier,
      );
    const usesStandardRenderer =
      isStandardRenderer &&
      timelineActivityType.applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier;

    if (usesStandardRenderer) {
      return;
    }

    const frontComponent =
      validationMaps.flatFrontComponentMaps.byUniversalIdentifier[
        frontComponentUniversalIdentifier
      ];

    if (
      isStandardRenderer ||
      !isDefined(frontComponent) ||
      frontComponent.applicationUniversalIdentifier !==
        timelineActivityType.applicationUniversalIdentifier
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type references a front component that does not belong to its application`,
        userFriendlyMessage: msg`The front component used by this timeline activity type is not available`,
      });
    }
  }

  private validateTimelineActivityTypeResolverConflict({
    timelineActivityType,
    validationMaps,
    validationResult,
  }: {
    timelineActivityType: UniversalFlatTimelineActivityType;
    validationMaps: TimelineActivityTypeValidationMaps;
    validationResult: TimelineActivityTypeValidationResult;
  }): void {
    if (!isDefined(timelineActivityType.action)) {
      return;
    }

    const existingTimelineActivityTypes = Object.values(
      validationMaps.flatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).filter(isDefined);
    const resolverCandidates = [
      ...existingTimelineActivityTypes.filter(
        (existing) =>
          existing.universalIdentifier !==
            timelineActivityType.universalIdentifier &&
          existing.action === timelineActivityType.action &&
          existing.objectUniversalIdentifier ===
            timelineActivityType.objectUniversalIdentifier &&
          existing.targetRelationFieldUniversalIdentifier ===
            timelineActivityType.targetRelationFieldUniversalIdentifier,
      ),
      timelineActivityType,
    ];
    const effectiveTimelineActivityType = resolveTimelineActivityTypeOverride(
      resolverCandidates,
      new Set([
        ...existingTimelineActivityTypes.map(
          (existing) => existing.universalIdentifier,
        ),
        timelineActivityType.universalIdentifier,
      ]),
    );

    if (!isDefined(effectiveTimelineActivityType)) {
      const conflictingResolverType = resolverCandidates.find(
        (candidate) =>
          candidate.universalIdentifier !==
          timelineActivityType.universalIdentifier,
      );

      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type conflicts with ${conflictingResolverType?.name ?? timelineActivityType.name} for the same action, object, and target relation`,
        userFriendlyMessage: msg`Another timeline activity type already handles this action, object, and target relation`,
      });
    }
  }
}

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isTimelineActivityAction } from 'twenty-shared/timeline';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type UniversalFlatTimelineActivityType } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-timeline-activity-type.type';

@Injectable()
export class FlatTimelineActivityTypeValidatorService {
  public validateFlatTimelineActivityTypeCreation({
    flatEntityToValidate: flatTimelineActivityType,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
    },
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
    const validationMaps = {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
    };

    if (!isNonEmptyString(flatTimelineActivityType.name)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type name is required`,
        userFriendlyMessage: msg`Timeline activity type name is required`,
      });
    }

    if (!isNonEmptyString(flatTimelineActivityType.label)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type label is required`,
        userFriendlyMessage: msg`Timeline activity type label is required`,
      });
    }

    if (
      isDefined(flatTimelineActivityType.action) &&
      !isTimelineActivityAction(flatTimelineActivityType.action)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Unknown timeline activity action ${flatTimelineActivityType.action}`,
        userFriendlyMessage: msg`This timeline activity action is not supported`,
      });
    }

    this.validateTimelineActivityTypeDependencies({
      timelineActivityType: flatTimelineActivityType,
      validationMaps,
      validationResult,
    });

    const existingByName = Object.values(
      optimisticFlatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).find(
      (existing) =>
        isDefined(existing) &&
        existing.name === flatTimelineActivityType.name &&
        existing.applicationUniversalIdentifier ===
          flatTimelineActivityType.applicationUniversalIdentifier &&
        existing.universalIdentifier !==
          flatTimelineActivityType.universalIdentifier,
    );

    if (isDefined(existingByName)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS,
        message: t`Timeline activity type with name ${flatTimelineActivityType.name} already exists for this application`,
        userFriendlyMessage: msg`A timeline activity type with this name already exists for this application`,
      });
    }

    this.validateTimelineActivityTypeResolverConflict({
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
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
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

    if (!isNonEmptyString(updatedTimelineActivityType.name)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type name is required`,
        userFriendlyMessage: msg`Timeline activity type name is required`,
      });
    }

    if (!isNonEmptyString(updatedTimelineActivityType.label)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type label is required`,
        userFriendlyMessage: msg`Timeline activity type label is required`,
      });
    }

    const existingByUpdatedName = Object.values(
      optimisticFlatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).find(
      (existing) =>
        isDefined(existing) &&
        existing.universalIdentifier !== universalIdentifier &&
        existing.name === updatedTimelineActivityType.name &&
        existing.applicationUniversalIdentifier ===
          updatedTimelineActivityType.applicationUniversalIdentifier,
    );

    if (isDefined(existingByUpdatedName)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS,
        message: t`Timeline activity type with name ${updatedTimelineActivityType.name} already exists for this application`,
        userFriendlyMessage: msg`A timeline activity type with this name already exists for this application`,
      });
    }

    if (
      isDefined(updatedTimelineActivityType.action) &&
      !isTimelineActivityAction(updatedTimelineActivityType.action)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Unknown timeline activity action ${updatedTimelineActivityType.action}`,
        userFriendlyMessage: msg`This timeline activity action is not supported`,
      });
    }

    const validationMaps = {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      flatFieldMetadataMaps: optimisticFlatFieldMetadataMaps,
    };

    this.validateTimelineActivityTypeDependencies({
      timelineActivityType: updatedTimelineActivityType,
      validationMaps,
      validationResult,
    });

    this.validateTimelineActivityTypeResolverConflict({
      timelineActivityType: updatedTimelineActivityType,
      validationMaps,
      validationResult,
    });

    return validationResult;
  }

  private validateTimelineActivityTypeDependencies({
    timelineActivityType,
    validationMaps,
    validationResult,
  }: {
    timelineActivityType: UniversalFlatTimelineActivityType;
    validationMaps: MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'timelineActivityType'>;
    validationResult: FailedFlatEntityValidation<
      'timelineActivityType',
      'create' | 'update'
    >;
  }): void {
    const {
      objectUniversalIdentifier,
      frontComponentUniversalIdentifier,
      targetRelationFieldUniversalIdentifier,
      triggerFieldUniversalIdentifiers,
    } = timelineActivityType;

    if (
      isDefined(objectUniversalIdentifier) &&
      !isDefined(
        validationMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          objectUniversalIdentifier
        ],
      )
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type references an object that does not exist`,
        userFriendlyMessage: msg`The object used by this timeline activity type is not available`,
      });
    }

    if (isDefined(targetRelationFieldUniversalIdentifier)) {
      const targetRelationField =
        validationMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          targetRelationFieldUniversalIdentifier
        ];

      if (
        !isDefined(timelineActivityType.action) ||
        !isDefined(objectUniversalIdentifier) ||
        !isDefined(targetRelationField) ||
        targetRelationField.objectMetadataUniversalIdentifier !==
          objectUniversalIdentifier ||
        !isMorphOrRelationUniversalFlatFieldMetadata(targetRelationField) ||
        targetRelationField.universalSettings?.relationType !==
          RelationType.ONE_TO_MANY ||
        !isDefined(
          targetRelationField.universalSettings
            ?.junctionTargetFieldUniversalIdentifier,
        )
      ) {
        validationResult.errors.push({
          code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
          message: t`Timeline activity type target relation must be a junction relation on its source object`,
          userFriendlyMessage: msg`The target relation used by this timeline activity type is not available`,
        });
      }
    }

    if (isDefined(triggerFieldUniversalIdentifiers)) {
      const hasInvalidTriggerField =
        timelineActivityType.action !== 'updated' ||
        !isDefined(targetRelationFieldUniversalIdentifier) ||
        triggerFieldUniversalIdentifiers.length === 0 ||
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

    const frontComponent =
      validationMaps.flatFrontComponentMaps.byUniversalIdentifier[
        frontComponentUniversalIdentifier
      ];

    if (
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
    validationMaps: MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'timelineActivityType'>;
    validationResult: FailedFlatEntityValidation<
      'timelineActivityType',
      'create' | 'update'
    >;
  }): void {
    if (!isDefined(timelineActivityType.action)) {
      return;
    }

    const conflictingResolverType = Object.values(
      validationMaps.flatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).find(
      (existing) =>
        isDefined(existing) &&
        existing.universalIdentifier !==
          timelineActivityType.universalIdentifier &&
        existing.action === timelineActivityType.action &&
        existing.objectUniversalIdentifier ===
          timelineActivityType.objectUniversalIdentifier &&
        existing.targetRelationFieldUniversalIdentifier ===
          timelineActivityType.targetRelationFieldUniversalIdentifier,
    );

    if (isDefined(conflictingResolverType)) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity type conflicts with ${conflictingResolverType.name} for the same action, object, and target relation`,
        userFriendlyMessage: msg`Another timeline activity type already handles this action, object, and target relation`,
      });
    }
  }
}

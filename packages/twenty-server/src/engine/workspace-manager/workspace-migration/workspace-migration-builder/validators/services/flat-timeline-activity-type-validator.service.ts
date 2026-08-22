import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import {
  isTimelineActivityAction,
  isTimelineActivityRenderer,
  type TimelineActivityRenderer,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

// The two renderers that draw from the row itself rather than from a linked
// record, so they need no object on the type.
const UNBOUND_TIMELINE_ACTIVITY_RENDERERS: TimelineActivityRenderer[] = [
  'mainObject',
  'genericLinked',
];

@Injectable()
export class FlatTimelineActivityTypeValidatorService {
  public validateFlatTimelineActivityTypeCreation({
    flatEntityToValidate: flatTimelineActivityType,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
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

    if (
      isDefined(flatTimelineActivityType.renderer) &&
      !isTimelineActivityRenderer(flatTimelineActivityType.renderer)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Unknown timeline activity renderer ${flatTimelineActivityType.renderer}`,
        userFriendlyMessage: msg`This timeline activity renderer is not supported`,
      });
    }

    // Every renderer but the generic ones reads a linked record off the row, so
    // it only ever makes sense on a type bound to the object it draws.
    if (
      isDefined(flatTimelineActivityType.renderer) &&
      !UNBOUND_TIMELINE_ACTIVITY_RENDERERS.includes(
        flatTimelineActivityType.renderer,
      ) &&
      !isDefined(flatTimelineActivityType.objectUniversalIdentifier)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
        message: t`Timeline activity renderer ${flatTimelineActivityType.renderer} requires the type to reference an object`,
        userFriendlyMessage: msg`This timeline activity renderer requires the type to reference an object`,
      });
    }

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
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.timelineActivityType
  >): FailedFlatEntityValidation<'timelineActivityType', 'update'> {
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
    }

    return validationResult;
  }
}

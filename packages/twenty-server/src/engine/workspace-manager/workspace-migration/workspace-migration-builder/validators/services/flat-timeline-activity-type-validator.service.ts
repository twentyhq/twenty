import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  isTimelineActivityAction,
  isTimelineActivityRenderer,
  type TimelineActivityRenderer,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type UniversalFlatTimelineActivityType } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-timeline-activity-type.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

// The two renderers that draw from the row itself rather than from a linked
// record, so they need no object on the type.
const UNBOUND_TIMELINE_ACTIVITY_RENDERERS: TimelineActivityRenderer[] = [
  'mainObject',
  'genericLinked',
];

type ValidateTimelineActivityTypePropertiesArgs = {
  flatTimelineActivityType: UniversalFlatTimelineActivityType;
  updatedProperties?: UniversalFlatEntityUpdate<'timelineActivityType'>;
};

const validateTimelineActivityTypeProperties = ({
  flatTimelineActivityType,
  updatedProperties,
}: ValidateTimelineActivityTypePropertiesArgs): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];
  const isUpdate = isDefined(updatedProperties);

  if (
    (!isUpdate || 'name' in updatedProperties) &&
    !isNonEmptyString(flatTimelineActivityType.name)
  ) {
    errors.push({
      code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      message: t`Timeline activity type name is required`,
      userFriendlyMessage: msg`Timeline activity type name is required`,
    });
  }

  if (
    (!isUpdate || 'label' in updatedProperties) &&
    !isNonEmptyString(flatTimelineActivityType.label)
  ) {
    errors.push({
      code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      message: t`Timeline activity type label is required`,
      userFriendlyMessage: msg`Timeline activity type label is required`,
    });
  }

  if (
    (!isUpdate || 'action' in updatedProperties) &&
    isDefined(flatTimelineActivityType.action) &&
    !isTimelineActivityAction(flatTimelineActivityType.action)
  ) {
    errors.push({
      code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      message: t`Unknown timeline activity action ${flatTimelineActivityType.action}`,
      userFriendlyMessage: msg`This timeline activity action is not supported`,
    });
  }

  if (
    (!isUpdate || 'renderer' in updatedProperties) &&
    isDefined(flatTimelineActivityType.renderer) &&
    !isTimelineActivityRenderer(flatTimelineActivityType.renderer)
  ) {
    errors.push({
      code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      message: t`Unknown timeline activity renderer ${flatTimelineActivityType.renderer}`,
      userFriendlyMessage: msg`This timeline activity renderer is not supported`,
    });
  }

  const shouldValidateRendererBinding =
    !isUpdate ||
    'renderer' in updatedProperties ||
    'objectUniversalIdentifier' in updatedProperties;

  // Every renderer but the generic ones reads a linked record off the row, so
  // it only ever makes sense on a type bound to the object it draws.
  if (
    shouldValidateRendererBinding &&
    isDefined(flatTimelineActivityType.renderer) &&
    !UNBOUND_TIMELINE_ACTIVITY_RENDERERS.includes(
      flatTimelineActivityType.renderer,
    ) &&
    !isDefined(flatTimelineActivityType.objectUniversalIdentifier)
  ) {
    errors.push({
      code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      message: t`Timeline activity renderer ${flatTimelineActivityType.renderer} requires the type to reference an object`,
      userFriendlyMessage: msg`This timeline activity renderer requires the type to reference an object`,
    });
  }

  return errors;
};

type ValidateTimelineActivityTypeNameUniquenessArgs = {
  flatTimelineActivityType: UniversalFlatTimelineActivityType;
  existingFlatTimelineActivityTypes: UniversalFlatTimelineActivityType[];
};

const validateTimelineActivityTypeNameUniqueness = ({
  flatTimelineActivityType,
  existingFlatTimelineActivityTypes,
}: ValidateTimelineActivityTypeNameUniquenessArgs): FlatEntityValidationError[] => {
  const existingByName = existingFlatTimelineActivityTypes.find(
    (existing) =>
      existing.name === flatTimelineActivityType.name &&
      existing.applicationUniversalIdentifier ===
        flatTimelineActivityType.applicationUniversalIdentifier &&
      existing.universalIdentifier !==
        flatTimelineActivityType.universalIdentifier,
  );

  if (!isDefined(existingByName)) {
    return [];
  }

  return [
    {
      code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NAME_ALREADY_EXISTS,
      message: t`Timeline activity type with name ${flatTimelineActivityType.name} already exists for this application`,
      userFriendlyMessage: msg`A timeline activity type with this name already exists for this application`,
    },
  ];
};

type ValidateTimelineActivityTypeObjectBindingArgs = {
  flatTimelineActivityType: UniversalFlatTimelineActivityType;
  flatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, { universalIdentifier: string }>
    >;
  };
};

const validateTimelineActivityTypeObjectBinding = ({
  flatTimelineActivityType,
  flatObjectMetadataMaps,
}: ValidateTimelineActivityTypeObjectBindingArgs): FlatEntityValidationError[] => {
  if (
    !isDefined(flatTimelineActivityType.objectUniversalIdentifier) ||
    isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        flatTimelineActivityType.objectUniversalIdentifier
      ],
    )
  ) {
    return [];
  }

  return [
    {
      code: TimelineActivityTypeExceptionCode.INVALID_TIMELINE_ACTIVITY_TYPE_INPUT,
      message: t`Timeline activity type references an object that does not exist`,
      userFriendlyMessage: msg`The object referenced by this timeline activity type does not exist`,
    },
  ];
};

type TimelineActivityTypeValidationMaps = {
  flatTimelineActivityTypeMaps: MetadataUniversalFlatEntityMaps<'timelineActivityType'>;
  flatObjectMetadataMaps: ValidateTimelineActivityTypeObjectBindingArgs['flatObjectMetadataMaps'];
};

type TimelineActivityTypeCreationValidationArgs = {
  flatEntityToValidate: UniversalFlatTimelineActivityType;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: TimelineActivityTypeValidationMaps;
};

type TimelineActivityTypeDeletionValidationArgs = {
  flatEntityToValidate: UniversalFlatTimelineActivityType;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: Pick<
    TimelineActivityTypeValidationMaps,
    'flatTimelineActivityTypeMaps'
  >;
  buildOptions: WorkspaceMigrationBuilderOptions;
};

type TimelineActivityTypeUpdateValidationArgs = {
  universalIdentifier: string;
  flatEntityUpdate: UniversalFlatEntityUpdate<'timelineActivityType'>;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: TimelineActivityTypeValidationMaps;
  buildOptions: WorkspaceMigrationBuilderOptions;
};

@Injectable()
export class FlatTimelineActivityTypeValidatorService {
  public validateFlatTimelineActivityTypeCreation({
    flatEntityToValidate: flatTimelineActivityType,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
    },
  }: TimelineActivityTypeCreationValidationArgs): FailedFlatEntityValidation<
    'timelineActivityType',
    'create'
  > {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatTimelineActivityType.universalIdentifier,
        name: flatTimelineActivityType.name,
      },
      metadataName: 'timelineActivityType',
      type: 'create',
    });

    const existingFlatTimelineActivityTypes = Object.values(
      optimisticFlatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).filter(isDefined);
    validationResult.errors.push(
      ...validateTimelineActivityTypeProperties({ flatTimelineActivityType }),
      ...validateTimelineActivityTypeNameUniqueness({
        flatTimelineActivityType,
        existingFlatTimelineActivityTypes,
      }),
      ...validateTimelineActivityTypeObjectBinding({
        flatTimelineActivityType,
        flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatTimelineActivityTypeDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
    },
    buildOptions,
  }: TimelineActivityTypeDeletionValidationArgs): FailedFlatEntityValidation<
    'timelineActivityType',
    'delete'
  > {
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

      return validationResult;
    }

    if (
      !isCallerTwentyStandardApp(buildOptions) &&
      belongsToTwentyStandardApp(existingTimelineActivityType)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_IS_STANDARD,
        message: t`Cannot delete standard timeline activity type`,
        userFriendlyMessage: msg`Cannot delete standard timeline activity type`,
      });
    }

    return validationResult;
  }

  public validateFlatTimelineActivityTypeUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityTypeMaps: optimisticFlatTimelineActivityTypeMaps,
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
    },
    buildOptions,
  }: TimelineActivityTypeUpdateValidationArgs): FailedFlatEntityValidation<
    'timelineActivityType',
    'update'
  > {
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

    if (
      !isCallerTwentyStandardApp(buildOptions) &&
      belongsToTwentyStandardApp(fromFlatTimelineActivityType)
    ) {
      validationResult.errors.push({
        code: TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_IS_STANDARD,
        message: t`Cannot update standard timeline activity type`,
        userFriendlyMessage: msg`Cannot update standard timeline activity type`,
      });

      return validationResult;
    }

    const optimisticFlatTimelineActivityType: UniversalFlatTimelineActivityType =
      {
        ...fromFlatTimelineActivityType,
        ...flatEntityUpdate,
      };

    validationResult.errors.push(
      ...validateTimelineActivityTypeProperties({
        flatTimelineActivityType: optimisticFlatTimelineActivityType,
        updatedProperties: flatEntityUpdate,
      }),
    );

    if ('name' in flatEntityUpdate) {
      const existingFlatTimelineActivityTypes = Object.values(
        optimisticFlatTimelineActivityTypeMaps.byUniversalIdentifier,
      ).filter(isDefined);

      validationResult.errors.push(
        ...validateTimelineActivityTypeNameUniqueness({
          flatTimelineActivityType: optimisticFlatTimelineActivityType,
          existingFlatTimelineActivityTypes,
        }),
      );
    }

    if ('objectUniversalIdentifier' in flatEntityUpdate) {
      validationResult.errors.push(
        ...validateTimelineActivityTypeObjectBinding({
          flatTimelineActivityType: optimisticFlatTimelineActivityType,
          flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
        }),
      );
    }

    return validationResult;
  }
}

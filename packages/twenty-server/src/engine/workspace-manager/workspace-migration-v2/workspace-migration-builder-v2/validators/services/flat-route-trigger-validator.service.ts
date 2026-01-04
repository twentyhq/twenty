import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { RouteTriggerExceptionCode } from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatRouteTriggerValidatorService {
  constructor() {}

  public validateFlatRouteTriggerUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRouteTriggerMaps: optimisticFlatRouteTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.routeTrigger
  >): FailedFlatEntityValidation<'routeTrigger', 'update'> {
    const existingFlatRouteTrigger =
      optimisticFlatRouteTriggerMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatRouteTrigger?.universalIdentifier,
      },
      metadataName: 'routeTrigger',
      type: 'update',
    });

    if (!isDefined(existingFlatRouteTrigger)) {
      validationResult.errors.push({
        code: RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
        message: t`Route not found`,
        userFriendlyMessage: msg`Route not found`,
      });

      return validationResult;
    }

    const updatedFlatRouteTrigger = {
      ...existingFlatRouteTrigger,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const serverlessFunction =
      flatServerlessFunctionMaps.byId[
        updatedFlatRouteTrigger.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      validationResult.errors.push({
        code: RouteTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }

  public validateFlatRouteTriggerDeletion({
    flatEntityToValidate: { id: routeTriggerIdToDelete, universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRouteTriggerMaps: optimisticFlatRouteTriggerMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.routeTrigger
  >): FailedFlatEntityValidation<'routeTrigger', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: routeTriggerIdToDelete,
        universalIdentifier,
      },
      metadataName: 'routeTrigger',
      type: 'delete',
    });

    const existingFlatRouteTrigger =
      optimisticFlatRouteTriggerMaps.byId[routeTriggerIdToDelete];

    if (!isDefined(existingFlatRouteTrigger)) {
      validationResult.errors.push({
        code: RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
        message: t`Route not found`,
        userFriendlyMessage: msg`Route not found`,
      });
    }

    return validationResult;
  }

  public validateFlatRouteTriggerCreation({
    flatEntityToValidate: flatRouteTriggerToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRouteTriggerMaps: optimisticFlatRouteTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.routeTrigger
  >): FailedFlatEntityValidation<'routeTrigger', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatRouteTriggerToValidate.id,
        universalIdentifier: flatRouteTriggerToValidate.universalIdentifier,
      },
      metadataName: 'routeTrigger',
      type: 'create',
    });

    if (
      isDefined(
        optimisticFlatRouteTriggerMaps.byId[flatRouteTriggerToValidate.id],
      )
    ) {
      validationResult.errors.push({
        code: RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST,
        message: t`Route with same id already exists`,
        userFriendlyMessage: msg`Route already exists`,
      });
    }

    const existingFlatRouteTriggers = Object.values(
      optimisticFlatRouteTriggerMaps.byId,
    ).filter(isDefined);

    if (
      existingFlatRouteTriggers.find(
        (flatRouteTrigger) =>
          flatRouteTrigger.path === flatRouteTriggerToValidate.path,
      )
    ) {
      validationResult.errors.push({
        code: RouteTriggerExceptionCode.ROUTE_PATH_ALREADY_EXIST,
        message: t`Route with same path already exists`,
        userFriendlyMessage: msg`Route path already exists`,
      });
    }

    const serverlessFunction =
      flatServerlessFunctionMaps.byId[
        flatRouteTriggerToValidate.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      validationResult.errors.push({
        code: RouteTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }
}

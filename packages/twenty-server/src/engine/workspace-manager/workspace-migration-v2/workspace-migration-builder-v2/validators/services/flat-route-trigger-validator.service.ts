import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { RouteTriggerExceptionCode } from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
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
  >): FailedFlatEntityValidation<FlatRouteTrigger> {
    const validationResult: FailedFlatEntityValidation<FlatRouteTrigger> = {
      type: 'update_route_trigger',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatRouteTrigger =
      optimisticFlatRouteTriggerMaps.byId[flatEntityId];

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
    flatEntityToValidate: { id: routeTriggerIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRouteTriggerMaps: optimisticFlatRouteTriggerMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.routeTrigger
  >): FailedFlatEntityValidation<FlatRouteTrigger> {
    const validationResult: FailedFlatEntityValidation<FlatRouteTrigger> = {
      type: 'delete_route_trigger',
      errors: [],
      flatEntityMinimalInformation: {
        id: routeTriggerIdToDelete,
      },
    };

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

  public async validateFlatRouteTriggerCreation({
    flatEntityToValidate: flatRouteTriggerToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRouteTriggerMaps: optimisticFlatRouteTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.routeTrigger>): Promise<
    FailedFlatEntityValidation<FlatRouteTrigger>
  > {
    const validationResult: FailedFlatEntityValidation<FlatRouteTrigger> = {
      type: 'create_route_trigger',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatRouteTriggerToValidate.id,
      },
    };

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

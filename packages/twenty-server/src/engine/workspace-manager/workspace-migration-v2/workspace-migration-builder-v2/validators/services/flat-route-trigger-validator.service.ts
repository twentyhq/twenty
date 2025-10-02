import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { RouteTriggerExceptionCode } from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type RouteTriggerRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatRouteTriggerMaps'
>;

type RouteTriggerValidationArgs = {
  flatRouteTriggerToValidate: FlatRouteTrigger;
  optimisticFlatRouteTriggerMaps: FlatEntityMaps<FlatRouteTrigger>;
  dependencyOptimisticFlatEntityMaps: RouteTriggerRelatedFlatEntityMaps;
};

@Injectable()
export class FlatRouteTriggerValidatorService {
  constructor() {}

  public validateFlatRouteTriggerUpdate({
    flatRouteTriggerToValidate: updatedFlatRouteTrigger,
    optimisticFlatRouteTriggerMaps,
  }: RouteTriggerValidationArgs): FailedFlatEntityValidation<FlatRouteTrigger> {
    const errors = [];

    const existingFlatRouteTrigger =
      optimisticFlatRouteTriggerMaps.byId[updatedFlatRouteTrigger.id];

    if (!isDefined(existingFlatRouteTrigger)) {
      errors.push({
        code: RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
        message: t`Route not found`,
        userFriendlyMessage: t`Route not found`,
      });
    }

    return {
      type: 'update_route_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: updatedFlatRouteTrigger.id,
      },
    };
  }

  public validateFlatRouteTriggerDeletion({
    flatRouteTriggerToValidate: { id: routeTriggerIdToDelete },
    optimisticFlatRouteTriggerMaps,
  }: RouteTriggerValidationArgs): FailedFlatEntityValidation<FlatRouteTrigger> {
    const errors = [];

    const existingFlatRouteTrigger =
      optimisticFlatRouteTriggerMaps.byId[routeTriggerIdToDelete];

    if (!isDefined(existingFlatRouteTrigger)) {
      errors.push({
        code: RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
        message: t`Route not found`,
        userFriendlyMessage: t`Route not found`,
      });
    }

    return {
      type: 'delete_route_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: routeTriggerIdToDelete,
      },
    };
  }

  public async validateFlatRouteTriggerCreation({
    flatRouteTriggerToValidate,
    optimisticFlatRouteTriggerMaps,
  }: RouteTriggerValidationArgs): Promise<
    FailedFlatEntityValidation<FlatRouteTrigger>
  > {
    const errors = [];

    if (
      isDefined(
        optimisticFlatRouteTriggerMaps.byId[flatRouteTriggerToValidate.id],
      )
    ) {
      errors.push({
        code: RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST,
        message: t`Route with same id already exists`,
        userFriendlyMessage: t`Route already exists`,
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
      errors.push({
        code: RouteTriggerExceptionCode.ROUTE_PATH_ALREADY_EXIST,
        message: t`Route with same path already exists`,
        userFriendlyMessage: t`Route path already exists`,
      });
    }

    return {
      type: 'create_route_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: flatRouteTriggerToValidate.id,
      },
    };
  }
}

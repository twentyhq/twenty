import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { RouteExceptionCode } from 'src/engine/metadata-modules/route/exceptions/route.exception';
import { FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type RouteRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatRouteMaps'
>;

type RouteValidationArgs = {
  flatRouteToValidate: FlatRoute;
  optimisticFlatRouteMaps: FlatEntityMaps<FlatRoute>;
  dependencyOptimisticFlatEntityMaps: RouteRelatedFlatEntityMaps;
};

@Injectable()
export class FlatRouteValidatorService {
  constructor() {}

  public validateFlatRouteUpdate({
    flatRouteToValidate: updatedFlatRoute,
    optimisticFlatRouteMaps,
  }: RouteValidationArgs): FailedFlatEntityValidation<FlatRoute> {
    const errors = [];

    const existingFlatRoute = optimisticFlatRouteMaps.byId[updatedFlatRoute.id];

    if (!isDefined(existingFlatRoute)) {
      errors.push({
        code: RouteExceptionCode.ROUTE_NOT_FOUND,
        message: t`Route not found`,
        userFriendlyMessage: t`Route not found`,
      });
    }

    return {
      type: 'update_route',
      errors,
      flatEntityMinimalInformation: {
        id: updatedFlatRoute.id,
      },
    };
  }

  public validateFlatRouteDeletion({
    flatRouteToValidate: { id: routeIdToDelete },
    optimisticFlatRouteMaps,
  }: RouteValidationArgs): FailedFlatEntityValidation<FlatRoute> {
    const errors = [];

    const existingFlatRoute = optimisticFlatRouteMaps.byId[routeIdToDelete];

    if (!isDefined(existingFlatRoute)) {
      errors.push({
        code: RouteExceptionCode.ROUTE_NOT_FOUND,
        message: t`Route not found`,
        userFriendlyMessage: t`Route not found`,
      });
    }

    return {
      type: 'delete_route',
      errors,
      flatEntityMinimalInformation: {
        id: routeIdToDelete,
      },
    };
  }

  public async validateFlatRouteCreation({
    flatRouteToValidate,
    optimisticFlatRouteMaps,
  }: RouteValidationArgs): Promise<FailedFlatEntityValidation<FlatRoute>> {
    const errors = [];

    if (isDefined(optimisticFlatRouteMaps.byId[flatRouteToValidate.id])) {
      errors.push({
        code: RouteExceptionCode.ROUTE_ALREADY_EXIST,
        message: t`Route with same id already exists`,
        userFriendlyMessage: t`Route already exists`,
      });
    }

    const existingFlatRoutes = Object.values(
      optimisticFlatRouteMaps.byId,
    ).filter(isDefined);

    if (
      existingFlatRoutes.find(
        (flatRoute) => flatRoute.path === flatRouteToValidate.path,
      )
    ) {
      errors.push({
        code: RouteExceptionCode.ROUTE_PATH_ALREADY_EXIST,
        message: t`Route with same path already exists`,
        userFriendlyMessage: t`Route path already exists`,
      });
    }

    return {
      type: 'create_route',
      errors,
      flatEntityMinimalInformation: {
        id: flatRouteToValidate.id,
      },
    };
  }
}

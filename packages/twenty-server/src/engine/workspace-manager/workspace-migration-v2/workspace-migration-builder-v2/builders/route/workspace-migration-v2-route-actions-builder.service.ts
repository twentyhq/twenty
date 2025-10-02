import { Injectable } from '@nestjs/common';

import { FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';
import { compareTwoFlatRoute } from 'src/engine/metadata-modules/route/utils/compare-two-flat-route.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateRouteAction,
  WorkspaceMigrationRouteActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-action-v2.type';
import {
  FlatRouteValidatorService,
  RouteRelatedFlatEntityMaps,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-route-validator.service';

@Injectable()
export class WorkspaceMigrationV2RouteActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatRoute,
  WorkspaceMigrationRouteActionV2,
  RouteRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatRouteValidatorService: FlatRouteValidatorService,
  ) {
    super();
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatRouteToValidate,
    optimisticFlatEntityMaps: optimisticFlatRouteMaps,
  }: FlatEntityValidationArgs<FlatRoute, RouteRelatedFlatEntityMaps>): Promise<
    FlatEntityValidationReturnType<WorkspaceMigrationRouteActionV2, FlatRoute>
  > {
    const validationResult =
      await this.flatRouteValidatorService.validateFlatRouteCreation({
        flatRouteToValidate,
        optimisticFlatRouteMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create_route',
        route: flatRouteToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatRouteToValidate,
    optimisticFlatEntityMaps: optimisticFlatRouteMaps,
  }: FlatEntityValidationArgs<FlatRoute, RouteRelatedFlatEntityMaps>): Promise<
    FlatEntityValidationReturnType<WorkspaceMigrationRouteActionV2, FlatRoute>
  > {
    const validationResult =
      this.flatRouteValidatorService.validateFlatRouteDeletion({
        flatRouteToValidate,
        optimisticFlatRouteMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete_route',
        routeId: flatRouteToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatRoute, to: toFlatRoute },
    optimisticFlatEntityMaps: optimisticFlatRouteMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatRoute,
    RouteRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<WorkspaceMigrationRouteActionV2, FlatRoute>
    | undefined
  > {
    const routeUpdatedProperties = compareTwoFlatRoute({
      fromFlatRoute,
      toFlatRoute,
    });

    if (routeUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatRouteValidatorService.validateFlatRouteUpdate({
        flatRouteToValidate: toFlatRoute,
        optimisticFlatRouteMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateRouteAction: UpdateRouteAction = {
      type: 'update_route',
      routeId: toFlatRoute.id,
      updates: routeUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateRouteAction,
    };
  }
}

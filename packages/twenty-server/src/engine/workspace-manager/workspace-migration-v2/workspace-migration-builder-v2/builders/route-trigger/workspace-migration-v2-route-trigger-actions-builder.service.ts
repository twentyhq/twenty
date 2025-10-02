import { Injectable } from '@nestjs/common';

import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { compareTwoFlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/utils/compare-two-flat-route-trigger.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateRouteTriggerAction,
  WorkspaceMigrationRouteTriggerActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-trigger-action-v2.type';
import {
  FlatRouteTriggerValidatorService,
  RouteTriggerRelatedFlatEntityMaps,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-route-trigger-validator.service';

@Injectable()
export class WorkspaceMigrationV2RouteTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatRouteTrigger,
  WorkspaceMigrationRouteTriggerActionV2,
  RouteTriggerRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatRouteTriggerValidatorService: FlatRouteTriggerValidatorService,
  ) {
    super();
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatRouteTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatRouteTriggerMaps,
  }: FlatEntityValidationArgs<
    FlatRouteTrigger,
    RouteTriggerRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationRouteTriggerActionV2,
      FlatRouteTrigger
    >
  > {
    const validationResult =
      await this.flatRouteTriggerValidatorService.validateFlatRouteTriggerCreation(
        {
          flatRouteTriggerToValidate,
          optimisticFlatRouteTriggerMaps,
          dependencyOptimisticFlatEntityMaps,
        },
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create_route_trigger',
        routeTrigger: flatRouteTriggerToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatRouteTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatRouteTriggerMaps,
  }: FlatEntityValidationArgs<
    FlatRouteTrigger,
    RouteTriggerRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationRouteTriggerActionV2,
      FlatRouteTrigger
    >
  > {
    const validationResult =
      this.flatRouteTriggerValidatorService.validateFlatRouteTriggerDeletion({
        flatRouteTriggerToValidate,
        optimisticFlatRouteTriggerMaps,
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
        type: 'delete_route_trigger',
        routeTriggerId: flatRouteTriggerToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatRouteTrigger, to: toFlatRouteTrigger },
    optimisticFlatEntityMaps: optimisticFlatRouteTriggerMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatRouteTrigger,
    RouteTriggerRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationRouteTriggerActionV2,
        FlatRouteTrigger
      >
    | undefined
  > {
    const routeTriggerUpdatedProperties = compareTwoFlatRouteTrigger({
      fromFlatRouteTrigger,
      toFlatRouteTrigger,
    });

    if (routeTriggerUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatRouteTriggerValidatorService.validateFlatRouteTriggerUpdate({
        flatRouteTriggerToValidate: toFlatRouteTrigger,
        optimisticFlatRouteTriggerMaps,
        dependencyOptimisticFlatEntityMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateRouteTriggerAction: UpdateRouteTriggerAction = {
      type: 'update_route_trigger',
      routeTriggerId: toFlatRouteTrigger.id,
      updates: routeTriggerUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateRouteTriggerAction,
    };
  }
}

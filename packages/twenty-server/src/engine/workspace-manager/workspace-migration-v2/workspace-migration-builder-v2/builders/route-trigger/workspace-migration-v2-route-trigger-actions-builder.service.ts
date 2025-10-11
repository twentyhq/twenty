import { Injectable } from '@nestjs/common';

import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { compareTwoFlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/utils/compare-two-flat-route-trigger.util';
import { UpdateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/types/workspace-migration-route-trigger-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatRouteTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-route-trigger-validator.service';

const ROUTE_TRIGGER_METADATA_NAME =
  'routeTrigger' as const satisfies AllMetadataName;

@Injectable()
export class WorkspaceMigrationV2RouteTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ROUTE_TRIGGER_METADATA_NAME
> {
  constructor(
    private readonly flatRouteTriggerValidatorService: FlatRouteTriggerValidatorService,
  ) {
    super(ROUTE_TRIGGER_METADATA_NAME);
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatRouteTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatRouteTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<typeof ROUTE_TRIGGER_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<
      typeof ROUTE_TRIGGER_METADATA_NAME,
      'created'
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
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion({
    flatEntityToValidate: flatRouteTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatRouteTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<typeof ROUTE_TRIGGER_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<
      typeof ROUTE_TRIGGER_METADATA_NAME,
      'deleted'
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
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate({
    flatEntityUpdate: { from: fromFlatRouteTrigger, to: toFlatRouteTrigger },
    optimisticFlatEntityMaps: optimisticFlatRouteTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ROUTE_TRIGGER_METADATA_NAME
  >): Promise<
    | FlatEntityValidationReturnType<
        typeof ROUTE_TRIGGER_METADATA_NAME,
        'updated'
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
      dependencyOptimisticFlatEntityMaps,
    };
  }
}

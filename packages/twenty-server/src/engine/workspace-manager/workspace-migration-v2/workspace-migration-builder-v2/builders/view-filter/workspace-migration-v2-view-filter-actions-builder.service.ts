import { Injectable } from '@nestjs/common';

import { FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { compareTwoFlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/utils/compare-two-flat-view-filter.util';
import { ViewFilterRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/view-filter-related-flat-entity-maps.type';
import {
    FlatEntityUpdateValidationArgs,
    FlatEntityValidationArgs,
    FlatEntityValidationReturnType,
    WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
    UpdateViewFilterAction,
    WorkspaceMigrationViewFilterActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-filter-action-v2.type';
import { FlatViewFilterValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-filter-validator.service';

@Injectable()
export class WorkspaceMigrationV2ViewFilterActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'viewFilter',
  FlatViewFilter,
  WorkspaceMigrationViewFilterActionV2,
  ViewFilterRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatViewFilterValidatorService: FlatViewFilterValidatorService,
  ) {
    super('viewFilter');
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewFilterToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewFilterMaps,
  }: FlatEntityValidationArgs<
    FlatViewFilter,
    ViewFilterRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationViewFilterActionV2,
      FlatViewFilter,
      ViewFilterRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      this.flatViewFilterValidatorService.validateFlatViewFilterCreation({
        dependencyOptimisticFlatEntityMaps,
        flatViewFilterToValidate,
        optimisticFlatViewFilterMaps,
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
        type: 'create_view_filter',
        viewFilter: flatViewFilterToValidate,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewFilterToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewFilterMaps,
  }: FlatEntityValidationArgs<
    FlatViewFilter,
    ViewFilterRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationViewFilterActionV2,
      FlatViewFilter,
      ViewFilterRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      this.flatViewFilterValidatorService.validateFlatViewFilterDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatViewFilterToValidate,
        optimisticFlatViewFilterMaps,
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
        type: 'delete_view_filter',
        viewFilterId: flatViewFilterToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatViewFilter, to: toFlatViewFilter },
    optimisticFlatEntityMaps: optimisticFlatViewFilterMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatViewFilter,
    ViewFilterRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationViewFilterActionV2,
        FlatViewFilter,
        ViewFilterRelatedFlatEntityMaps
      >
    | undefined
  > {
    const viewFilterUpdatedProperties = compareTwoFlatViewFilter({
      fromFlatViewFilter,
      toFlatViewFilter,
    });

    if (viewFilterUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatViewFilterValidatorService.validateFlatViewFilterUpdate({
        dependencyOptimisticFlatEntityMaps,
        flatViewFilterToValidate: toFlatViewFilter,
        optimisticFlatViewFilterMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateViewFilterAction: UpdateViewFilterAction = {
      type: 'update_view_filter',
      viewFilterId: toFlatViewFilter.id,
      updates: viewFilterUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateViewFilterAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}


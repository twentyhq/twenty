import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { compareTwoFlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/utils/compare-two-flat-view-filter.util';
import { UpdateViewFilterAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/workspace-migration-view-filter-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatViewFilterValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-filter-validator.service';

const VIEW_FILTER_METADATA_NAME = 'viewFilter' as const satisfies AllMetadataName;
@Injectable()
export class WorkspaceMigrationV2ViewFilterActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof VIEW_FILTER_METADATA_NAME
> {
  constructor(
    private readonly flatViewFilterValidatorService: FlatViewFilterValidatorService,
  ) {
    super(VIEW_FILTER_METADATA_NAME);
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewFilterToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewFilterMaps,
  }: FlatEntityValidationArgs<typeof VIEW_FILTER_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof VIEW_FILTER_METADATA_NAME, 'created'>
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

    const flatView = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewFilterToValidate.viewId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    const updatedFlatViewMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: {
        ...flatView,
        viewFilterIds: [...flatView.viewFilterIds, flatViewFilterToValidate.id],
      },
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    return {
      status: 'success',
      action: {
        type: 'create_view_filter',
        viewFilter: flatViewFilterToValidate,
      },
      dependencyOptimisticFlatEntityMaps: {
        ...dependencyOptimisticFlatEntityMaps,
        flatViewMaps: updatedFlatViewMaps,
      },
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewFilterToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewFilterMaps,
  }: FlatEntityValidationArgs<typeof VIEW_FILTER_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof VIEW_FILTER_METADATA_NAME, 'deleted'>
  > {
    const validationResult =
      this.flatViewFilterValidatorService.validateFlatViewFilterDeletion({
        flatViewFilterToValidate,
        optimisticFlatViewFilterMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewFilterToValidate.viewId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
    });

    const updatedFlatViewMaps = isDefined(flatView)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...flatView,
            viewFilterIds: flatView.viewFilterIds.filter(
              (id) => id !== flatViewFilterToValidate.id,
            ),
          },
          flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatViewMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatViewMaps;

    return {
      status: 'success',
      action: {
        type: 'delete_view_filter',
        viewFilterId: flatViewFilterToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps: {
        ...dependencyOptimisticFlatEntityMaps,
        flatViewMaps: updatedFlatViewMaps,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatViewFilter, to: toFlatViewFilter },
    optimisticFlatEntityMaps: optimisticFlatViewFilterMaps,
  }: FlatEntityUpdateValidationArgs<typeof VIEW_FILTER_METADATA_NAME>): Promise<
    | FlatEntityValidationReturnType<typeof VIEW_FILTER_METADATA_NAME, 'updated'>
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

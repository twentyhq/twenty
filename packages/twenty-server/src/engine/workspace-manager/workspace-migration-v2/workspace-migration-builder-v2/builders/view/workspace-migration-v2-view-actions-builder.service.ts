import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';
import { compareTwoFlatView } from 'src/engine/core-modules/view/flat-view/utils/compare-two-flat-view.util';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateViewAction,
  WorkspaceMigrationViewActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

export type ViewRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps'
>;
@Injectable()
export class WorkspaceMigrationV2ViewActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'view',
  FlatView,
  WorkspaceMigrationViewActionV2,
  ViewRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatViewValidatorService: FlatViewValidatorService,
  ) {
    super('view');
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityValidationArgs<FlatView, ViewRelatedFlatEntityMaps>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationViewActionV2,
      FlatView,
      ViewRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      await this.flatViewValidatorService.validateFlatViewCreation({
        dependencyOptimisticFlatEntityMaps,
        flatViewToValidate,
        optimisticFlatViewMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatViewToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });
    const updatedFlatObjectMetadataMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: {
          ...flatObjectMetadata,
          viewIds: [...flatObjectMetadata.viewIds, flatViewToValidate.id],
        },
        flatEntityMaps:
          dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
      });

    return {
      status: 'success',
      action: {
        type: 'create_view',
        view: flatViewToValidate,
      },
      dependencyOptimisticFlatEntityMaps: {
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
      },
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityValidationArgs<FlatView, ViewRelatedFlatEntityMaps>): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationViewActionV2,
      FlatView,
      ViewRelatedFlatEntityMaps
    >
  > {
    const validationResult =
      this.flatViewValidatorService.validateFlatViewDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatViewToValidate,
        optimisticFlatViewMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    const updatedFlatObjectMetadataMaps = isDefined(flatObjectMetadata)
      ? replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...flatObjectMetadata,
            viewIds: flatObjectMetadata.viewIds.filter(
              (id) => id !== flatViewToValidate.id,
            ),
          },
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
        })
      : dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps;

    return {
      status: 'success',
      action: {
        type: 'delete_view',
        viewId: flatViewToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps: {
        flatObjectMetadataMaps: updatedFlatObjectMetadataMaps,
      },
    };
  }

  protected async validateFlatEntityUpdate({
    dependencyOptimisticFlatEntityMaps,
    flatEntityUpdate: { from: fromFlatView, to: toFlatView },
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityUpdateValidationArgs<
    FlatView,
    ViewRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationViewActionV2,
        FlatView,
        ViewRelatedFlatEntityMaps
      >
    | undefined
  > {
    const viewUpdatedProperties = compareTwoFlatView({
      fromFlatView,
      toFlatView,
    });

    if (viewUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatViewValidatorService.validateFlatViewUpdate({
        dependencyOptimisticFlatEntityMaps,
        flatViewToValidate: toFlatView,
        optimisticFlatViewMaps,
      });

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateViewAction: UpdateViewAction = {
      type: 'update_view',
      viewId: toFlatView.id,
      updates: viewUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateViewAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}

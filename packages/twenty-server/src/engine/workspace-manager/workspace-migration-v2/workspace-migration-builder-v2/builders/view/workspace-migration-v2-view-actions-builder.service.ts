import { Injectable } from '@nestjs/common';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
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
import {
  getWorkspaceMigrationV2ViewCreateAction,
  getWorkspaceMigrationV2ViewDeleteAction,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/get-workspace-migration-v2-view-action';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

export type ViewRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps'
  // 'flatFieldMetadataMaps' TODO implement once with extract field from object diffing
>;
@Injectable()
export class WorkspaceMigrationV2ViewActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  FlatView,
  WorkspaceMigrationViewActionV2,
  ViewRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatViewValidatorService: FlatViewValidatorService,
  ) {
    super();
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityValidationArgs<FlatView, ViewRelatedFlatEntityMaps>): Promise<
    FlatEntityValidationReturnType<WorkspaceMigrationViewActionV2, FlatView>
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

    return {
      status: 'success',
      action: getWorkspaceMigrationV2ViewCreateAction(flatViewToValidate),
    };
  }

  protected async validateFlatEntityDeletion({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityValidationArgs<FlatView, ViewRelatedFlatEntityMaps>): Promise<
    FlatEntityValidationReturnType<WorkspaceMigrationViewActionV2, FlatView>
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

    return {
      status: 'success',
      action: getWorkspaceMigrationV2ViewDeleteAction(flatViewToValidate),
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
    | FlatEntityValidationReturnType<WorkspaceMigrationViewActionV2, FlatView>
    | undefined
  > {
    const viewFieldUpdatedProperties = compareTwoFlatView({
      fromFlatView,
      toFlatView,
    });

    if (viewFieldUpdatedProperties.length === 0) {
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

    const updateViewFieldAction: UpdateViewAction = {
      type: 'update_view',
      viewId: toFlatView.id,
      updates: viewFieldUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateViewFieldAction,
    };
  }
}

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_CONFIGURATION } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-configuration.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { compareTwoFlatView } from 'src/engine/metadata-modules/flat-view/utils/compare-two-flat-view.util';
import { UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/types/workspace-migration-view-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-view-validator.service';

export type ViewRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  (typeof ALL_FLAT_ENTITY_CONFIGURATION.view.relatedFlatEntityMapsKeys)[number]
>;
const VIEW_METADATA_NAME = 'view' as const satisfies AllMetadataName;
@Injectable()
export class WorkspaceMigrationV2ViewActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof VIEW_METADATA_NAME
> {
  constructor(
    private readonly flatViewValidatorService: FlatViewValidatorService,
  ) {
    super(VIEW_METADATA_NAME);
  }

  protected async validateFlatEntityCreation({
    dependencyOptimisticFlatEntityMaps,
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMaps: optimisticFlatViewMaps,
  }: FlatEntityValidationArgs<typeof VIEW_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof VIEW_METADATA_NAME, 'created'>
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
  }: FlatEntityValidationArgs<typeof VIEW_METADATA_NAME>): Promise<
    FlatEntityValidationReturnType<typeof VIEW_METADATA_NAME, 'deleted'>
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
  }: FlatEntityUpdateValidationArgs<typeof VIEW_METADATA_NAME>): Promise<
    | FlatEntityValidationReturnType<typeof VIEW_METADATA_NAME, 'updated'>
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

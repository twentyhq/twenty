import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-delete-navigation-menu-item-input-to-flat-navigation-menu-item-or-throw.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class NavigationMenuItemDeletionService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async deleteNavigationMenuItemsForDeletedRecords(
    deletedRecordIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const deletedRecordIdsSet = new Set(deletedRecordIds);

    const navigationMenuItemsToDelete = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).filter(
      (item): item is NonNullable<typeof item> =>
        isDefined(item) &&
        isDefined(item.targetRecordId) &&
        !isDefined(item.viewId) &&
        deletedRecordIdsSet.has(item.targetRecordId),
    );

    if (navigationMenuItemsToDelete.length === 0) {
      return;
    }

    const flatNavigationMenuItemsToDelete = navigationMenuItemsToDelete.map(
      (item) =>
        fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow({
          flatNavigationMenuItemMaps,
          navigationMenuItemId: item.id,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatNavigationMenuItemsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting navigation menu items for deleted records',
      );
    }
  }
}

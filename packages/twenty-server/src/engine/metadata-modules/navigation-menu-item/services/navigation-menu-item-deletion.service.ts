import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromDeleteNavigationMenuItemInputToFlatNavigationMenuItemOrThrow } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-delete-navigation-menu-item-input-to-flat-navigation-menu-item-or-throw.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class NavigationMenuItemDeletionService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async deleteNavigationMenuItemsForDeletedRecords(
    deletedRecordIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const { flatNavigationMenuItemMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatNavigationMenuItemMaps'],
        },
      );

    const deletedRecordIdsSet = new Set(deletedRecordIds);

    const navigationMenuItemsToDelete = Object.values(
      flatNavigationMenuItemMaps.byId,
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting navigation menu items for deleted records',
      );
    }
  }
}

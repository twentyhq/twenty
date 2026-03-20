import { NavigationMenuItemDeletionService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-deletion.service';

describe('NavigationMenuItemDeletionService', () => {
  const workspaceId = 'workspace-id';

  const recordNavigationMenuItem = {
    id: 'record-nav-item-id',
    universalIdentifier: 'record-nav-item-id',
    targetRecordId: 'record-id',
    viewId: null,
  };

  const viewNavigationMenuItem = {
    id: 'view-nav-item-id',
    universalIdentifier: 'view-nav-item-id',
    targetRecordId: null,
    viewId: 'view-id',
  };

  const unrelatedNavigationMenuItem = {
    id: 'other-nav-item-id',
    universalIdentifier: 'other-nav-item-id',
    targetRecordId: 'other-record-id',
    viewId: null,
  };

  const buildFlatNavigationMenuItemMaps = (items: Array<{ id: string }>) => ({
    byUniversalIdentifier: Object.fromEntries(
      items.map((item) => [item.id, item]),
    ),
    universalIdentifierById: Object.fromEntries(
      items.map((item) => [item.id, item.id]),
    ),
    universalIdentifiersByApplicationId: {},
    byUserWorkspaceIdAndFolderId: {},
  });

  const applicationService = {
    findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(),
  };
  const workspaceManyOrAllFlatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
  };
  const workspaceMigrationValidateBuildAndRunService = {
    validateBuildAndRunWorkspaceMigration: jest.fn(),
  };

  let service: NavigationMenuItemDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();

    applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow.mockResolvedValue(
      {
        workspaceCustomFlatApplication: {
          universalIdentifier: 'workspace-custom-app-ui',
        },
      },
    );

    workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
      {
        status: 'success',
      },
    );

    service = new NavigationMenuItemDeletionService(
      workspaceManyOrAllFlatEntityMapsCacheService as never,
      workspaceMigrationValidateBuildAndRunService as never,
      applicationService as never,
    );
  });

  it('should delete navigation menu items for deleted records and deleted views', async () => {
    workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      {
        flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([
          recordNavigationMenuItem,
          viewNavigationMenuItem,
          unrelatedNavigationMenuItem,
        ]),
      },
    );

    await service.deleteNavigationMenuItemsForDeletedRecords(
      ['record-id', 'view-id'],
      workspaceId,
    );

    expect(
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
    ).toHaveBeenCalledWith({
      allFlatEntityOperationByMetadataName: {
        navigationMenuItem: {
          flatEntityToCreate: [],
          flatEntityToDelete: [
            recordNavigationMenuItem,
            viewNavigationMenuItem,
          ],
          flatEntityToUpdate: [],
        },
      },
      workspaceId,
      isSystemBuild: false,
      applicationUniversalIdentifier: 'workspace-custom-app-ui',
    });
  });

  it('should return early when no deleted records or views match navigation menu items', async () => {
    workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      {
        flatNavigationMenuItemMaps: buildFlatNavigationMenuItemMaps([
          unrelatedNavigationMenuItem,
        ]),
      },
    );

    await service.deleteNavigationMenuItemsForDeletedRecords(
      ['record-id', 'view-id'],
      workspaceId,
    );

    expect(
      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
    ).not.toHaveBeenCalled();
  });
});

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getNavigationMenuItemFlatEntitySeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-navigation-menu-item-data-seeds.util';
import { getPageLayoutFlatEntitySeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-data-seeds.util';
import { getPageLayoutTabFlatEntitySeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-tab-data-seeds.util';
import { getPageLayoutWidgetFlatEntitySeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

export const seedPageLayouts = async ({
  workspaceId,
  flatApplication,
  objectMetadataItems,
  workspaceMigrationValidateBuildAndRunService,
}: {
  workspaceId: string;
  flatApplication: FlatApplication;
  objectMetadataItems: ObjectMetadataEntity[];
  workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;
}): Promise<void> => {
  const pageLayouts = getPageLayoutFlatEntitySeeds({
    workspaceId,
    flatApplication,
  });

  const pageLayoutTabs = getPageLayoutTabFlatEntitySeeds({
    workspaceId,
    flatApplication,
  });

  const pageLayoutWidgets = getPageLayoutWidgetFlatEntitySeeds({
    workspaceId,
    flatApplication,
    objectMetadataItems,
  });

  const navigationMenuItems = getNavigationMenuItemFlatEntitySeeds({
    workspaceId,
    flatApplication,
  });

  const result =
    await workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        allFlatEntityOperationByMetadataName: {
          pageLayout: {
            flatEntityToCreate: pageLayouts,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          pageLayoutTab: {
            flatEntityToCreate: pageLayoutTabs,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          pageLayoutWidget: {
            flatEntityToCreate: pageLayoutWidgets,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          navigationMenuItem: {
            flatEntityToCreate: navigationMenuItems,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
        workspaceId,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
      },
    );

  if (result.status === 'fail') {
    throw new WorkspaceMigrationBuilderException(
      result,
      'Failed to seed page layouts, tabs, widgets, and navigation menu items',
    );
  }
};

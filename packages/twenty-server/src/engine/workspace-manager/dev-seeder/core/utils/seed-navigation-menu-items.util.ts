import { type DataSource } from 'typeorm';

import { getNavigationMenuItemDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-navigation-menu-item-data-seeds.util';

export const seedNavigationMenuItems = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
  applicationId: string,
) => {
  const navigationMenuItems = getNavigationMenuItemDataSeeds(
    workspaceId,
    applicationId,
  );

  if (navigationMenuItems.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.navigationMenuItem`, [
        'id',
        'type',
        'name',
        'icon',
        'color',
        'pageLayoutId',
        'position',
        'workspaceId',
        'universalIdentifier',
        'applicationId',
      ])
      .values(navigationMenuItems)
      .orIgnore()
      .execute();
  }
};

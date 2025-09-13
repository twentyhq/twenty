import { type DataSource } from 'typeorm';

import { getPageLayoutDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-data-seeds.constant';
import { getPageLayoutTabDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-data-seeds.constant';

export const seedPageLayouts = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  const pageLayouts = getPageLayoutDataSeeds(workspaceId);

  if (pageLayouts.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.pageLayout`, [
        'id',
        'name',
        'type',
        'objectMetadataId',
        'workspaceId',
      ])
      .values(pageLayouts)
      .orIgnore()
      .execute();
  }

  const pageLayoutTabs = getPageLayoutTabDataSeeds(workspaceId);

  if (pageLayoutTabs.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.pageLayoutTab`, [
        'id',
        'title',
        'position',
        'pageLayoutId',
        'workspaceId',
      ])
      .values(pageLayoutTabs)
      .orIgnore()
      .execute();
  }
};

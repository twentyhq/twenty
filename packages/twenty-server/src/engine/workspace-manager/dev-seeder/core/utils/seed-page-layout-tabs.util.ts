import { type DataSource } from 'typeorm';

import { getPageLayoutTabDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-tab-data-seeds.util';

export const seedPageLayoutTabs = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
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

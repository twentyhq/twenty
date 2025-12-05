import { type DataSource } from 'typeorm';

import { getPageLayoutTabDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-tab-data-seeds.util';

export const seedPageLayoutTabs = async ({
  applicationId,
  dataSource,
  schemaName,
  workspaceId,
}: {
  dataSource: DataSource;
  schemaName: string;
  applicationId: string;
  workspaceId: string;
}) => {
  const pageLayoutTabs = getPageLayoutTabDataSeeds({
    workspaceId,
    applicationId,
  });

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
        'universalIdentifier',
        'applicationId',
      ])
      .values(pageLayoutTabs)
      .orIgnore()
      .execute();
  }
};

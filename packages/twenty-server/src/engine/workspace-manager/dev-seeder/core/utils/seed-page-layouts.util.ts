import { type DataSource } from 'typeorm';

import { getPageLayoutDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-data-seeds.constant';
import { getPageLayoutTabDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-data-seeds.constant';

export const seedPageLayouts = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  const pageLayouts = getPageLayoutDataSeeds(workspaceId);

  for (const pageLayout of pageLayouts) {
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
      .values({
        id: pageLayout.id,
        name: pageLayout.name,
        type: pageLayout.type,
        objectMetadataId: pageLayout.objectMetadataId,
        workspaceId: pageLayout.workspaceId,
      })
      .orIgnore()
      .execute();
  }

  const pageLayoutTabs = getPageLayoutTabDataSeeds(workspaceId);

  for (const tab of pageLayoutTabs) {
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
      .values({
        id: tab.id,
        title: tab.title,
        position: tab.position,
        pageLayoutId: tab.pageLayoutId,
        workspaceId: tab.workspaceId,
      })
      .orIgnore()
      .execute();
  }
};

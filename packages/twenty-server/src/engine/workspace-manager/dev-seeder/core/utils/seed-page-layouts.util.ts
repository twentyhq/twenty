import { type DataSource } from 'typeorm';

import { getPageLayoutDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-data-seeds.util';

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
};

import { type DataSource } from 'typeorm';

import { PAGE_LAYOUT_WIDGET_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/page-layout-widget-data-seeds.constant';

export const seedPageLayoutWidgets = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  const pageLayoutWidgets = PAGE_LAYOUT_WIDGET_DATA_SEEDS.map((widget) => ({
    ...widget,
    workspaceId,
    gridPosition: widget.gridPosition,
    configuration: widget.configuration,
  }));

  if (pageLayoutWidgets.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.pageLayoutWidget`, [
        'id',
        'pageLayoutTabId',
        'title',
        'type',
        'gridPosition',
        'configuration',
        'objectMetadataId',
        'workspaceId',
      ])
      .values(pageLayoutWidgets)
      .orIgnore()
      .execute();
  }
};

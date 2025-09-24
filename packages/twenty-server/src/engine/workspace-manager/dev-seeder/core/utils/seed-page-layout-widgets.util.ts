import { type DataSource } from 'typeorm';

import { getPageLayoutWidgetDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds.util';

export const seedPageLayoutWidgets = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  const pageLayoutWidgets = getPageLayoutWidgetDataSeeds(workspaceId).map(
    (widget) => ({
      ...widget,
      workspaceId,
      gridPosition: widget.gridPosition,
      configuration: widget.configuration,
    }),
  );

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

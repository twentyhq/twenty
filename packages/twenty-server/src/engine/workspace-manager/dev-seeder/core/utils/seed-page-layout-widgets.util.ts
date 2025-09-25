import { type DataSource } from 'typeorm';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getPageLayoutWidgetDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds.util';

export const seedPageLayoutWidgets = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const pageLayoutWidgets = getPageLayoutWidgetDataSeeds(
    workspaceId,
    objectMetadataItems,
  ).map((widget) => ({
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

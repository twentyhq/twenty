import { type DataSource } from 'typeorm';

import { validateAndTransformWidgetConfiguration } from 'src/engine/core-modules/page-layout/utils/validate-and-transform-widget-configuration.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getPageLayoutWidgetDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds.util';

export const seedPageLayoutWidgets = async ({
  dataSource,
  schemaName,
  workspaceId,
  objectMetadataItems,
  isDashboardV2Enabled,
}: {
  dataSource: DataSource;
  schemaName: string;
  workspaceId: string;
  objectMetadataItems: ObjectMetadataEntity[];
  isDashboardV2Enabled: boolean;
}) => {
  const pageLayoutWidgets = getPageLayoutWidgetDataSeeds(
    workspaceId,
    objectMetadataItems,
  ).map((widget) => {
    const validatedConfiguration = widget.configuration
      ? validateAndTransformWidgetConfiguration({
          type: widget.type,
          configuration: widget.configuration,
          isDashboardV2Enabled,
        })
      : null;

    return {
      ...widget,
      workspaceId,
      gridPosition: widget.gridPosition,
      configuration: validatedConfiguration,
    };
  });

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

import { type DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { validateAndTransformWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-and-transform-widget-configuration.util';
import { getPageLayoutWidgetDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds.util';

export const seedPageLayoutWidgets = async ({
  dataSource,
  schemaName,
  workspaceId,
  objectMetadataItems,
  isDashboardV2Enabled,
  workspaceCustomApplicationId,
}: {
  dataSource: DataSource;
  schemaName: string;
  workspaceId: string;
  objectMetadataItems: ObjectMetadataEntity[];
  isDashboardV2Enabled: boolean;
  workspaceCustomApplicationId: string;
}) => {
  const widgetSeeds = getPageLayoutWidgetDataSeeds(
    workspaceId,
    objectMetadataItems,
    isDashboardV2Enabled,
  );

  const pageLayoutWidgets = await Promise.all(
    widgetSeeds.map(async (widget) => {
      const validatedConfiguration = widget.configuration
        ? await validateAndTransformWidgetConfiguration({
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
        universalIdentifier: v4(),
        applicationId: workspaceCustomApplicationId,
      };
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
        'universalIdentifier',
        'applicationId',
      ])
      .values(pageLayoutWidgets)
      .orIgnore()
      .execute();
  }
};

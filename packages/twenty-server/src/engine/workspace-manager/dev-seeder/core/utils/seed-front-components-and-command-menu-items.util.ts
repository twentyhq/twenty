import { type DataSource } from 'typeorm';

import { getFrontComponentAndCommandMenuItemDataSeeds } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-front-component-and-command-menu-item-data-seeds.util';

type SeedFrontComponentsAndCommandMenuItemsArgs = {
  dataSource: DataSource;
  schemaName: string;
  workspaceId: string;
  applicationId: string;
};

export const seedFrontComponentsAndCommandMenuItems = async ({
  dataSource,
  schemaName,
  workspaceId,
  applicationId,
}: SeedFrontComponentsAndCommandMenuItemsArgs) => {
  const { frontComponents, commandMenuItems } =
    getFrontComponentAndCommandMenuItemDataSeeds(workspaceId, applicationId);

  if (frontComponents.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.frontComponent`, [
        'id',
        'name',
        'workspaceId',
        'universalIdentifier',
        'applicationId',
        'sourceComponentPath',
        'builtComponentPath',
        'componentName',
        'builtComponentChecksum',
      ])
      .values(
        frontComponents.map((row) => ({
          id: row.id,
          name: row.name,
          workspaceId: row.workspaceId,
          universalIdentifier: row.universalIdentifier,
          applicationId: row.applicationId,
          sourceComponentPath: row.sourceComponentPath,
          builtComponentPath: row.builtComponentPath,
          componentName: row.componentName,
          builtComponentChecksum: row.builtComponentChecksum,
        })),
      )
      .orIgnore()
      .execute();
  }

  if (commandMenuItems.length > 0) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}.commandMenuItem`, [
        'id',
        'workspaceId',
        'universalIdentifier',
        'applicationId',
        'workflowVersionId',
        'frontComponentId',
        'label',
        'icon',
        'isPinned',
        'availabilityType',
        'availabilityObjectMetadataId',
      ])
      .values(
        commandMenuItems.map((row) => ({
          id: row.id,
          workspaceId: row.workspaceId,
          universalIdentifier: row.universalIdentifier,
          applicationId: row.applicationId,
          workflowVersionId: row.workflowVersionId,
          frontComponentId: row.frontComponentId,
          label: row.label,
          icon: row.icon,
          isPinned: row.isPinned,
          availabilityType: row.availabilityType,
          availabilityObjectMetadataId: row.availabilityObjectMetadataId,
        })),
      )
      .orIgnore()
      .execute();
  }
};

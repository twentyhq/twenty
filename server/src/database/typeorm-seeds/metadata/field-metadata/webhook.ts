import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedWebhookFieldMetadataIds {
  TargetUrl = '20202020-c16e-4ba8-bb24-bbd88e9cdabc',
  Operation = '20202020-5995-493a-92a8-31376e5c052a',
}

export const seedWebhookFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${fieldMetadataTableName}`, [
      'id',
      'objectMetadataId',
      'isCustom',
      'workspaceId',
      'isActive',
      'type',
      'name',
      'label',
      'targetColumnMap',
      'description',
      'icon',
      'isNullable',
    ])
    .orIgnore()
    .values([
      // Scalar fields
      {
        id: SeedWebhookFieldMetadataIds.TargetUrl,
        objectMetadataId: SeedObjectMetadataIds.Webhook,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'targetUrl',
        label: 'Target Url',
        targetColumnMap: {
          value: 'targetUrl',
        },
        description: 'Webhook target url',
        icon: 'IconLink',
        isNullable: false,
      },
      {
        id: SeedWebhookFieldMetadataIds.Operation,
        objectMetadataId: SeedObjectMetadataIds.Webhook,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'operation',
        label: 'Operation',
        targetColumnMap: {
          value: 'operation',
        },
        description: 'Webhook operation',
        icon: 'IconCheckbox',
        isNullable: false,
      },
    ])
    .execute();
};

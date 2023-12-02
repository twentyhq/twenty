import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedWebhookFieldMetadataIds {
  Id = '20202020-bc24-4387-8abe-9fbe7849f820',
  CreatedAt = '20202020-c643-4324-9032-f38117fbca3b',
  UpdatedAt = '20202020-489b-4f1d-80a4-2dddf6fa0e7c',

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
      'isSystem',
      'defaultValue',
    ])
    .orIgnore()
    .values([
      // Default fields
      {
        id: SeedWebhookFieldMetadataIds.Id,
        objectMetadataId: SeedObjectMetadataIds.Webhook,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'id',
        label: 'Id',
        targetColumnMap: {
          value: 'id',
        },
        description: undefined,
        icon: undefined,
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'uuid' },
      },
      {
        id: SeedWebhookFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.Webhook,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE_TIME,
        name: 'createdAt',
        label: 'Creation date',
        targetColumnMap: {
          value: 'createdAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'now' },
      },
      {
        id: SeedWebhookFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.Webhook,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE_TIME,
        name: 'updatedAt',
        label: 'Update date',
        targetColumnMap: {
          value: 'updatedAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'now' },
      },
      // Scalar fields
      {
        id: SeedWebhookFieldMetadataIds.TargetUrl,
        objectMetadataId: SeedObjectMetadataIds.Webhook,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'targetUrl',
        label: 'Target Url',
        targetColumnMap: {
          value: 'targetUrl',
        },
        description: 'Webhook target url',
        icon: 'IconLink',
        isNullable: false,
        isSystem: false,
        defaultValue: { value: '' },
      },
      {
        id: SeedWebhookFieldMetadataIds.Operation,
        objectMetadataId: SeedObjectMetadataIds.Webhook,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'operation',
        label: 'Operation',
        targetColumnMap: {
          value: 'operation',
        },
        description: 'Webhook operation',
        icon: 'IconCheckbox',
        isNullable: false,
        isSystem: false,
        defaultValue: { value: '' },
      },
    ])
    .execute();
};

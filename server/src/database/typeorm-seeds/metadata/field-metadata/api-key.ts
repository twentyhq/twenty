import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedApiKeyFieldMetadataIds {
  Name = '20202020-1dfa-4ef3-8d19-51e82c28677a',
  ExpiresAt = '20202020-a092-41e2-940e-e17cd0403aa7',
  RevokedAt = '20202020-da41-436e-8498-b1a99c23b275',
}

export const seedApiKeyFieldMetadata = async (
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
        id: SeedApiKeyFieldMetadataIds.Name,
        objectMetadataId: SeedObjectMetadataIds.ApiKey,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'name',
        label: 'Name',
        targetColumnMap: {
          value: 'name',
        },
        description: 'ApiKey name',
        icon: 'IconLink',
        isNullable: false,
      },
      {
        id: SeedApiKeyFieldMetadataIds.ExpiresAt,
        objectMetadataId: SeedObjectMetadataIds.ApiKey,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'DATE',
        name: 'expiresAt',
        label: 'Expiration date',
        targetColumnMap: {
          value: 'expiresAt',
        },
        description: 'ApiKey expiration date',
        icon: 'IconCalendar',
        isNullable: false,
      },
      {
        id: SeedApiKeyFieldMetadataIds.RevokedAt,
        objectMetadataId: SeedObjectMetadataIds.ApiKey,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'DATE',
        name: 'revokedAt',
        label: 'Revocation date',
        targetColumnMap: {
          value: 'revokedAt',
        },
        description: 'ApiKey revocation date',
        icon: 'IconCalendar',
        isNullable: true,
      },
    ])
    .execute();
};

import { DataSource } from 'typeorm';

import { SeedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedApiKeyFieldMetadata {
  NameMetadataId = '20202020-1dfa-4ef3-8d19-51e82c28677a',
  ExpiresAtMetadataId = '20202020-a092-41e2-940e-e17cd0403aa7',
  RevokedAtMetadataId = '20202020-da41-436e-8498-b1a99c23b275',
}

export const seedOpportunityFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${fieldMetadataTableName}`, [
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
        id: SeedApiKeyFieldMetadata.NameMetadataId,
        objectMetadataId: SeedObjectMetadata.ApiKeyMetadataId,
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
        id: SeedApiKeyFieldMetadata.ExpiresAtMetadataId,
        objectMetadataId: SeedObjectMetadata.ApiKeyMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
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
        id: SeedApiKeyFieldMetadata.RevokedAtMetadataId,
        objectMetadataId: SeedObjectMetadata.ApiKeyMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
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

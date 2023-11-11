import { DataSource } from 'typeorm';

import { SeedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedWorkspaceMemberSettingsFieldMetadata {
  ColorSchemeMetadataId = '20202020-d7b7-4f2e-bb52-90d3fd78007a',
  LocaleMetadataId = '20202020-10f6-4df9-8d6f-a760b65bd800',
  WorkspaceMemberMetadataId = '20202020-83f2-4c5f-96b0-0c51ecc160e3',
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
        id: SeedWorkspaceMemberSettingsFieldMetadata.ColorSchemeMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberSettingsMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'colorScheme',
        label: 'Color Scheme',
        targetColumnMap: {
          value: 'colorScheme',
        },
        description: 'Preferred color scheme',
        icon: 'IconColorSwatch',
        isNullable: false,
      },
      {
        id: SeedWorkspaceMemberSettingsFieldMetadata.LocaleMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberSettingsMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'locale',
        label: 'Language',
        targetColumnMap: {
          value: 'colorScheme',
        },
        description: 'Preferred language',
        icon: 'IconLanguage',
        isNullable: false,
      },

      // Relationships
      {
        id: SeedWorkspaceMemberSettingsFieldMetadata.WorkspaceMemberMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberSettingsMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'workspaceMember',
        label: 'Workspace member',
        targetColumnMap: {
          value: 'workspaceMemberId',
        },
        description: 'Workspace member associated with these settings',
        icon: 'IconUserCircle',
        isNullable: false,
      },
    ])
    .execute();
};

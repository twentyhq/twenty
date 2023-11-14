import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedWorkspaceMemberSettingFieldMetadataIds {
  ColorScheme = '20202020-d7b7-4f2e-bb52-90d3fd78007a',
  Locale = '20202020-10f6-4df9-8d6f-a760b65bd800',
  WorkspaceMember = '20202020-83f2-4c5f-96b0-0c51ecc160e3',
}

export const seedWorkspaceMemberSettingFieldMetadata = async (
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
        id: SeedWorkspaceMemberSettingFieldMetadataIds.ColorScheme,
        objectMetadataId: SeedObjectMetadataIds.WorkspaceMemberSetting,
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
        id: SeedWorkspaceMemberSettingFieldMetadataIds.Locale,
        objectMetadataId: SeedObjectMetadataIds.WorkspaceMemberSetting,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'locale',
        label: 'Language',
        targetColumnMap: {
          value: 'locale',
        },
        description: 'Preferred language',
        icon: 'IconLanguage',
        isNullable: false,
      },

      // Relationships
      {
        id: SeedWorkspaceMemberSettingFieldMetadataIds.WorkspaceMember,
        objectMetadataId: SeedObjectMetadataIds.WorkspaceMemberSetting,
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

import { DataSource } from 'typeorm';

import { SeedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedWorkspaceMemberFieldMetadata {
  AllowImpersonationMetadataId = '20202020-bb19-44a1-8156-8866f87a5f42',
  UserIdMetadataId = '20202020-f2c1-4ca1-9ca5-7b9d5cc87eb0',
  AuthoredActivitiesMetadataId = '20202020-37a0-4db4-9c9f-fd3e3f4e47fc',
  AssignedActivitiesMetadataId = '20202020-ac05-44b9-9526-764dd5ce14e2',
  AuthoredAttachmentsMetadataId = '20202020-7e0c-4dc4-be49-37de4396349e',
  FavoritesMetadataId = '20202020-5ecb-405b-8712-171bb8916b96',
  SettingsMetadataId = '20202020-50ed-46ed-8198-65e237b83eb9',
  AccountOwnerForCompaniesMetadataId = '20202020-41bb-4c17-8979-40fa915df9e1',
  AuthoredCommentsMetadataId = '20202020-7238-4e2a-9ccf-d2c8f604933a',
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
        id: SeedWorkspaceMemberFieldMetadata.UserIdMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'UUID',
        name: 'userId',
        label: 'User Id',
        targetColumnMap: {
          value: 'userId',
        },
        description: 'Associated User Id',
        icon: 'IconCircleUsers',
        isNullable: false,
      },
      {
        id: SeedWorkspaceMemberFieldMetadata.AllowImpersonationMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'BOOLEAN',
        name: 'allowImpersonation',
        label: 'Admin Access',
        targetColumnMap: {
          value: 'allowImpersonation',
        },
        description: 'Allow Admin Access',
        icon: 'IconEye',
        isNullable: false,
      },

      // Relationships
      {
        id: SeedWorkspaceMemberFieldMetadata.AuthoredActivitiesMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'authoredActivities',
        label: 'Authored activities',
        targetColumnMap: {},
        description: 'Activities created by the workspace member',
        icon: 'IconCheckbox',
        isNullable: true,
      },
      {
        id: SeedWorkspaceMemberFieldMetadata.AssignedActivitiesMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'assignedActivities',
        label: 'Assigned activities',
        targetColumnMap: {},
        description: 'Activities assigned to the workspace member',
        icon: 'IconCheckbox',
        isNullable: true,
      },
      {
        id: SeedWorkspaceMemberFieldMetadata.FavoritesMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'favorites',
        label: 'Favorites',
        targetColumnMap: {},
        description: 'Favorites linked to the workspace member',
        icon: 'IconHeart',
        isNullable: true,
      },
      {
        id: SeedWorkspaceMemberFieldMetadata.AccountOwnerForCompaniesMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'accountOwnerForCompanies',
        label: 'Account Owner For Companies',
        targetColumnMap: {},
        description: 'Account owner for companies',
        icon: 'IconBriefcase',
        isNullable: true,
      },
      {
        id: SeedWorkspaceMemberFieldMetadata.AuthoredCommentsMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'authoredComments',
        label: 'Authored comments',
        targetColumnMap: {},
        description: 'Authored comments',
        icon: 'IconComment',
        isNullable: true,
      },
      {
        id: SeedWorkspaceMemberFieldMetadata.SettingsMetadataId,
        objectMetadataId: SeedObjectMetadata.WorkspaceMemberMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'settings',
        label: 'Settings',
        targetColumnMap: {
          value: 'settingsId',
        },
        description: 'Workspace member settings',
        icon: 'IconSettings',
        isNullable: false,
      },
    ])
    .execute();
};

import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedFavoriteFieldMetadataIds {
  Position = '20202020-dd6d-4f67-94aa-22cc83eb0a2e',

  WorkspaceMember = '20202020-1138-4e93-bbff-917a68161abf',
  Person = '20202020-0876-4735-8974-ff4d51aafa07',
  Company = '20202020-09e1-4384-ae3e-39e7956396fe',
}

export const seedFavoriteFieldMetadata = async (
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
        id: SeedFavoriteFieldMetadataIds.Position,
        objectMetadataId: SeedObjectMetadataIds.Favorite,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'NUMBER',
        name: 'position',
        label: 'Position',
        targetColumnMap: {
          value: 'position',
        },
        description: 'Favorite position',
        icon: 'IconList',
        isNullable: false,
      },

      // Relationships
      {
        id: SeedFavoriteFieldMetadataIds.WorkspaceMember,
        objectMetadataId: SeedObjectMetadataIds.Favorite,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'workspaceMember',
        label: 'Workspace Member',
        targetColumnMap: {
          value: 'workspaceMemberId',
        },
        description: 'Favorite workspace member',
        icon: 'IconCircleUser',
        isNullable: false,
      },
      {
        id: SeedFavoriteFieldMetadataIds.Person,
        objectMetadataId: SeedObjectMetadataIds.Favorite,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'person',
        label: 'Person',
        targetColumnMap: {
          value: 'personId',
        },
        description: 'Favorite person',
        icon: 'IconUser',
        isNullable: false,
      },
      {
        id: SeedFavoriteFieldMetadataIds.Company,
        objectMetadataId: SeedObjectMetadataIds.Favorite,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'company',
        label: 'Company',
        targetColumnMap: {
          value: 'companyId',
        },
        description: 'Favorite company',
        icon: 'IconBuildingSkyscraper',
        isNullable: false,
      },
    ])
    .execute();
};

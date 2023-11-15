import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedFavoriteFieldMetadataIds {
  Id = '20202020-7d1d-46c7-8c09-8e8c73e30042',
  CreatedAt = '20202020-a0f4-443c-a63d-2776a842d024',
  UpdatedAt = '20202020-273a-41bc-babf-f58f0b2ba2ec',

  Position = '20202020-dd6d-4f67-94aa-22cc83eb0a2e',

  WorkspaceMember = '20202020-1138-4e93-bbff-917a68161abf',
  Person = '20202020-0876-4735-8974-ff4d51aafa07',
  Company = '20202020-09e1-4384-ae3e-39e7956396fe',
  CompanyV2 = '20202020-09e1-4384-ae3e-39e7956396ff',
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
      // Default fields
      {
        id: SeedFavoriteFieldMetadataIds.Id,
        objectMetadataId: SeedObjectMetadataIds.Favorite,
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
        isNullable: true,
        // isSystem: true,
      },
      {
        id: SeedFavoriteFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.Favorite,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE,
        name: 'createdAt',
        label: 'Creation date',
        targetColumnMap: {
          value: 'createdAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: true,
      },
      {
        id: SeedFavoriteFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.Favorite,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE,
        name: 'updatedAt',
        label: 'Update date',
        targetColumnMap: {
          value: 'updatedAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: true,
      },
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
        isNullable: true,
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
        isNullable: true,
      },
    ])
    .execute();
};

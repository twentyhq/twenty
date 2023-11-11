import { DataSource } from 'typeorm';

import { SeedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedAttachmentFieldMetadata {
  NameMetadataId = '20202020-5683-4c80-8590-255321ece692',
  FullPathMetadataId = '20202020-bb72-4644-b255-afb4ebb83b66',
  TypeMetadataId = '20202020-8dfa-492f-92d1-56d5fb18cbb7',

  AuthorMetadataId = '20202020-7831-43c2-827f-bc78289b7398',
  ActivityMetadataId = '20202020-f5a9-46ec-b39a-eda906f00804',
  PersonMetadataId = '20202020-f67c-4cc5-893c-c6b615527473',
  CompanyMetadataId = '20202020-5463-4d03-9124-1775b9b7f955',
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
      // Primary Identifier
      {
        id: SeedAttachmentFieldMetadata.NameMetadataId,
        objectMetadataId: SeedObjectMetadata.AttachmentMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'name',
        label: 'Name',
        targetColumnMap: {
          value: 'name',
        },
        description: 'Attachment name',
        icon: 'IconFileUpload',
        isNullable: false,
      },
      // Scalar fields
      {
        id: SeedAttachmentFieldMetadata.FullPathMetadataId,
        objectMetadataId: SeedObjectMetadata.AttachmentMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'fullPath',
        label: 'Full path',
        targetColumnMap: {
          value: 'fullPath',
        },
        description: 'Attachment full path',
        icon: 'IconLink',
        isNullable: false,
      },
      {
        id: SeedAttachmentFieldMetadata.TypeMetadataId,
        objectMetadataId: SeedObjectMetadata.AttachmentMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'type',
        label: 'Type',
        targetColumnMap: {
          value: 'type',
        },
        description: 'Attachment type',
        icon: 'IconList',
        isNullable: false,
      },

      // Relationships
      {
        id: SeedAttachmentFieldMetadata.AuthorMetadataId,
        objectMetadataId: SeedObjectMetadata.AttachmentMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'author',
        label: 'Author',
        targetColumnMap: {
          value: 'authorId',
        },
        description: 'Attachment author',
        icon: 'IconCircleUser',
        isNullable: false,
      },
      {
        id: SeedAttachmentFieldMetadata.ActivityMetadataId,
        objectMetadataId: SeedObjectMetadata.AttachmentMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'activity',
        label: 'Activity',
        targetColumnMap: {
          value: 'activityId',
        },
        description: 'Attachment activity',
        icon: 'IconNotes',
        isNullable: false,
      },
      {
        id: SeedAttachmentFieldMetadata.PersonMetadataId,
        objectMetadataId: SeedObjectMetadata.AttachmentMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'person',
        label: 'Person',
        targetColumnMap: {
          value: 'personId',
        },
        description: 'Attachment person',
        icon: 'IconUser',
        isNullable: false,
      },
      {
        id: SeedAttachmentFieldMetadata.CompanyMetadataId,
        objectMetadataId: SeedObjectMetadata.AttachmentMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'company',
        label: 'Company',
        targetColumnMap: {
          value: 'companyId',
        },
        description: 'Attachment company',
        icon: 'IconBuildingSkyscraper',
        isNullable: false,
      },
    ])
    .execute();
};

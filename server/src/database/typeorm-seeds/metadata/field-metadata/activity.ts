import { DataSource } from 'typeorm';

import { SeedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedActivityFieldMetadata {
  TitleMetadataId = '20202020-2584-4797-95a8-5cc90d48c040',
  BodyMetadataId = '20202020-aff0-4961-be8a-0e5c2598b9a6',
  TypeMetadataId = '20202020-a243-4b94-a4b4-25705af86be2',
  ReminderAtMetadataId = '20202020-cd46-44f4-bf22-b0aa20d009da',
  DueAtMetadataId = '20202020-20e1-4366-b386-750bdca2dfe3',
  CompletedAtMetadataId = '20202020-0924-48f0-a8c2-d2dd4e2098e2',

  ActivityTargetsMetadataId = '20202020-ec1d-4ffe-8bd2-a85c23ae0037',
  CommentsMetadataId = '20202020-c85c-47f2-bbe4-6b36c26f9247',
  AttachmentsMetadataId = '20202020-9755-43a8-b621-f94df0f6b839',
  AuthorMetadataId = '20202020-3acb-46bb-b993-0dc49fa2a48c',
  AssigneeMetadataId = '20202020-4694-4ec6-9084-8d932ebb3065',
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
      // Primary identifier
      {
        id: SeedActivityFieldMetadata.TitleMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'title',
        label: 'Title',
        targetColumnMap: {
          value: 'title',
        },
        description: 'Activity title',
        icon: 'IconNotes',
        isNullable: true,
      },

      // Scalar fields
      {
        id: SeedActivityFieldMetadata.BodyMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'body',
        label: 'Body',
        targetColumnMap: {
          value: 'body',
        },
        description: 'Activity body',
        icon: 'IconList',
        isNullable: true,
      },
      {
        id: SeedActivityFieldMetadata.TypeMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'type',
        label: 'Type',
        targetColumnMap: {
          value: 'type',
        },
        description: 'Activity type',
        icon: 'IconCheckbox',
        isNullable: false,
      },
      {
        id: SeedActivityFieldMetadata.ReminderAtMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'reminderAt',
        label: 'Reminder Date',
        targetColumnMap: {
          value: 'reminderAt',
        },
        description: 'Activity reminder date',
        icon: 'IconCalendarEvent',
        isNullable: true,
      },
      {
        id: SeedActivityFieldMetadata.DueAtMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'dueAt',
        label: 'Due Date',
        targetColumnMap: {
          value: 'dueAt',
        },
        description: 'Activity due date',
        icon: 'IconCalendarEvent',
        isNullable: true,
      },
      {
        id: SeedActivityFieldMetadata.CompletedAtMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'completedAt',
        label: 'Completion Date',
        targetColumnMap: {
          value: 'completedAt',
        },
        description: 'Activity completion date',
        icon: 'IconCheck',
        isNullable: true,
      },

      // Relationships
      {
        id: SeedActivityFieldMetadata.ActivityTargetsMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'activityTargets',
        label: 'Targets',
        targetColumnMap: {},
        description: 'Activity targets',
        icon: 'IconCheckbox',
        isNullable: true,
      },
      {
        id: SeedActivityFieldMetadata.AttachmentsMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'attachments',
        label: 'Attachments',
        targetColumnMap: {},
        description: 'Activity attachments',
        icon: 'IconFileImport',
        isNullable: true,
      },
      {
        id: SeedActivityFieldMetadata.CommentsMetadataId,
        objectMetadataId: SeedObjectMetadata.ActivityMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'Comments',
        label: 'Comments',
        targetColumnMap: {},
        description: 'Activity comments',
        icon: 'IconComment',
        isNullable: true,
      },
      {
        id: SeedActivityFieldMetadata.AuthorMetadataId,
        objectMetadataId: SeedObjectMetadata.CompanyMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'author',
        label: 'Author',
        targetColumnMap: {
          value: 'authorId',
        },
        description:
          'Activity author. This is the person who created the activity',
        icon: 'IconUserCircle',
        isNullable: false,
      },
      {
        id: SeedActivityFieldMetadata.AssigneeMetadataId,
        objectMetadataId: SeedObjectMetadata.CompanyMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'assignee',
        label: 'Assignee',
        targetColumnMap: {
          value: 'assigneeId',
        },
        description:
          'Acitivity assignee. This is the workspace member assigned to the activity ',
        icon: 'IconUserCircle',
        isNullable: true,
      },
    ])
    .execute();
};

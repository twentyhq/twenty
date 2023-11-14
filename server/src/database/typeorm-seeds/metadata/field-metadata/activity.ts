import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedActivityFieldMetadataIds {
  Title = '20202020-2584-4797-95a8-5cc90d48c040',
  Body = '20202020-aff0-4961-be8a-0e5c2598b9a6',
  Type = '20202020-a243-4b94-a4b4-25705af86be2',
  ReminderAt = '20202020-cd46-44f4-bf22-b0aa20d009da',
  DueAt = '20202020-20e1-4366-b386-750bdca2dfe3',
  CompletedAt = '20202020-0924-48f0-a8c2-d2dd4e2098e2',

  ActivityTargets = '20202020-ec1d-4ffe-8bd2-a85c23ae0037',
  Comments = '20202020-c85c-47f2-bbe4-6b36c26f9247',
  Attachments = '20202020-9755-43a8-b621-f94df0f6b839',
  Author = '20202020-3acb-46bb-b993-0dc49fa2a48c',
  Assignee = '20202020-4694-4ec6-9084-8d932ebb3065',
}

export const seedActivityFieldMetadata = async (
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
      // Primary identifier
      {
        id: SeedActivityFieldMetadataIds.Title,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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
        id: SeedActivityFieldMetadataIds.Body,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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
        id: SeedActivityFieldMetadataIds.Type,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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
        id: SeedActivityFieldMetadataIds.ReminderAt,
        objectMetadataId: SeedObjectMetadataIds.Activity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'DATE',
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
        id: SeedActivityFieldMetadataIds.DueAt,
        objectMetadataId: SeedObjectMetadataIds.Activity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'DATE',
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
        id: SeedActivityFieldMetadataIds.CompletedAt,
        objectMetadataId: SeedObjectMetadataIds.Activity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'DATE',
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
        id: SeedActivityFieldMetadataIds.ActivityTargets,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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
        id: SeedActivityFieldMetadataIds.Attachments,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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
        id: SeedActivityFieldMetadataIds.Comments,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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
        id: SeedActivityFieldMetadataIds.Author,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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
        id: SeedActivityFieldMetadataIds.Assignee,
        objectMetadataId: SeedObjectMetadataIds.Activity,
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

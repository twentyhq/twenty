import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addAttachmentTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'attachment',
    action: 'create',
  },
  {
    name: 'attachment',
    action: 'alter',
    columns: [
      {
        columnName: 'name',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'fullPath',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'type',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'authorId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'activityId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'personId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];

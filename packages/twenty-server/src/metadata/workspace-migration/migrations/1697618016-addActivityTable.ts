import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addActivityTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'activity',
    action: 'create',
  },
  {
    name: 'activity',
    action: 'alter',
    columns: [
      {
        columnName: 'title',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'body',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "'{}'",
      },
      {
        columnName: 'type',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "'Note'",
      },
      {
        columnName: 'reminderAt',
        columnType: 'timestamp',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'dueAt',
        columnType: 'timestamp',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'completedAt',
        columnType: 'timestamp',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'authorId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'assigneeId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];

import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addWorkspaceMemberTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'workspaceMember',
    action: 'create',
  },
  {
    name: 'workspaceMember',
    action: 'alter',
    columns: [
      {
        columnName: 'firstName',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'lastName',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'avatarUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'colorScheme',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'locale',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: 'fr',
      },
      {
        columnName: 'allowImpersonation',
        columnType: 'boolean',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'userId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];

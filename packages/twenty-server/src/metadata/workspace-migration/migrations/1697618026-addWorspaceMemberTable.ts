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
        columnName: 'nameFirstName',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'nameLastName',
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
        defaultValue: "'Light'",
      },
      {
        columnName: 'locale',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "'en'",
      },
      {
        columnName: 'userId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];

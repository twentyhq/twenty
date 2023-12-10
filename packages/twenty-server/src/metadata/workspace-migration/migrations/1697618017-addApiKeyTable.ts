import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addApiKeyTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'apiKey',
    action: 'create',
  },
  {
    name: 'apiKey',
    action: 'alter',
    columns: [
      {
        columnName: 'name',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'revokedAt',
        columnType: 'timestamp',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'expiresAt',
        columnType: 'timestamp',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];

import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addApiKeyTable: StandardWorkspaceMigrationTableAction[] = [
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

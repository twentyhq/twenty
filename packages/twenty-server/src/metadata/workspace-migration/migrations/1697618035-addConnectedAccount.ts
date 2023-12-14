import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addConnectedAccount: StandardWorkspaceMigrationTableAction[] = [
  {
    name: 'connectedAccount',
    action: 'create',
  },
  {
    name: 'connectedAccount',
    action: 'alter',
    columns: [
      {
        columnName: 'type',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'accessToken',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'refreshToken',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'externalScopes',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'hasEmailScope',
        columnType: 'boolean',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: 'false',
      },
    ],
  },
];

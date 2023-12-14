import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addWebhookTable: StandardWorkspaceMigrationTableAction[] = [
  {
    name: 'webhook',
    action: 'create',
  },
  {
    name: 'webhook',
    action: 'alter',
    columns: [
      {
        columnName: 'targetUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'operation',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
    ],
  },
];

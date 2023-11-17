import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addWebhookTable: WorkspaceMigrationTableAction[] = [
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

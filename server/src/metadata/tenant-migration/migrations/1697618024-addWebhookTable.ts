import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWebhookTable: TenantMigrationTableAction[] = [
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
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'operation',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

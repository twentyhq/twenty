import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addApiKeyTable: TenantMigrationTableAction[] = [
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
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'revokedAt',
        columnType: 'timestamp',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'expiresAt',
        columnType: 'timestamp',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

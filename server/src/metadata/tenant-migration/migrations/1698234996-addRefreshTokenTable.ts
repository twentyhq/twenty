import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addRefreshTokensTable: TenantMigrationTableAction[] = [
  {
    name: 'refresh_token',
    action: 'create',
  },
  {
    name: 'refresh_token',
    action: 'alter',
    columns: [
      {
        name: 'expiresAt',
        type: 'timestamp',
        action: 'create',
      },
    ],
  },
];

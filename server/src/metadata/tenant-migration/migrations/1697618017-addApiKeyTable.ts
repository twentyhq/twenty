import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addApiKeyTable: TenantMigrationTableAction[] = [
  {
    name: 'apiKey',
    action: 'create',
  },
  {
    name: 'apiKey',
    action: 'alter',
    columns: [],
  },
];

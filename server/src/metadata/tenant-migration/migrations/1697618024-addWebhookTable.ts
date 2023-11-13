import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWebhookTable: TenantMigrationTableAction[] = [
  {
    name: 'webhook',
    action: 'create',
  },
  {
    name: 'webhook',
    action: 'alter',
    columns: [],
  },
];

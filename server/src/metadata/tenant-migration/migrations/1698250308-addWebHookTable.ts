import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWebHookTable: TenantMigrationTableAction[] = [
  {
    name: 'web_hooks',
    action: 'create',
  },
  {
    name: 'web_hooks',
    action: 'alter',
    columns: [
      {
        name: 'targetUrl',
        type: 'text',
        action: 'create',
      },
      {
        name: 'operation',
        type: 'text',
        action: 'create',
      },
    ],
  },
];

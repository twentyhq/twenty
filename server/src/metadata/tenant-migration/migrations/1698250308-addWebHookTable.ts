import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWebHookTable: TenantMigrationTableAction[] = [
  {
    name: 'web_hook',
    action: 'create',
  },
  {
    name: 'web_hook',
    action: 'alter',
    columns: [
      {
        name: 'id',
        type: 'text',
        action: 'create',
      },
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
      {
        name: 'createdAt',
        type: 'date',
        action: 'create',
      },
      {
        name: 'updatedAt',
        type: 'date',
        action: 'create',
      },
    ],
  },
];

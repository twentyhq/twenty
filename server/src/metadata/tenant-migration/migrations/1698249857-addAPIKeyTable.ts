import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addAPIKeyTable: TenantMigrationTableAction[] = [
  {
    name: 'api_key',
    action: 'create',
  },
  {
    name: 'api_key',
    action: 'alter',
    columns: [
      {
        name: 'id',
        type: 'text',
        action: 'create',
      },
      {
        name: 'name',
        type: 'text',
        action: 'create',
      },
      {
        name: 'expiresAt',
        type: 'date',
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

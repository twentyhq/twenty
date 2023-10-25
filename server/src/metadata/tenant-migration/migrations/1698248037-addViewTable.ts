import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewTable: TenantMigrationTableAction[] = [
  {
    name: 'view',
    action: 'create',
  },
  {
    name: 'view',
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
        name: 'objectId',
        type: 'text',
        action: 'create',
      },
    ],
  },
];

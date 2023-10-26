import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewTable: TenantMigrationTableAction[] = [
  {
    name: 'views',
    action: 'create',
  },
  {
    name: 'views',
    action: 'alter',
    columns: [
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

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
        name: 'name',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'objectId',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'type',
        type: 'varchar',
        action: 'create',
      },
    ],
  },
];

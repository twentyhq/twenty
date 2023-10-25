import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewFieldTable: TenantMigrationTableAction[] = [
  {
    name: 'view_field',
    action: 'create',
  },
  {
    name: 'view_field',
    action: 'alter',
    columns: [
      {
        name: 'index',
        type: 'text',
        action: 'create',
      },
      {
        name: 'isVisible',
        type: 'boolean',
        action: 'create',
      },
      {
        name: 'key',
        type: 'text',
        action: 'create',
      },
      {
        name: 'objectId',
        type: 'text',
        action: 'create',
      },
      {
        name: 'size',
        type: 'integer',
        action: 'create',
      },
    ],
  },
];

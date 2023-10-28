import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewFieldTable: TenantMigrationTableAction[] = [
  {
    name: 'viewField',
    action: 'create',
  },
  {
    name: 'viewField',
    action: 'alter',
    columns: [
      {
        name: 'objectId',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'fieldId',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'viewId',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'position',
        type: 'integer',
        action: 'create',
      },
      {
        name: 'isVisible',
        type: 'boolean',
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

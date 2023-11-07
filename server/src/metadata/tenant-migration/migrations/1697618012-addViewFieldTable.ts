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
        columnName: 'fieldId',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'viewId',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'position',
        columnType: 'integer',
        action: 'create',
      },
      {
        columnName: 'isVisible',
        columnType: 'boolean',
        action: 'create',
      },
      {
        columnName: 'size',
        columnType: 'integer',
        action: 'create',
      },
    ],
  },
];

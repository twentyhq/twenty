import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewSortTable: TenantMigrationTableAction[] = [
  {
    name: 'viewSort',
    action: 'create',
  },
  {
    name: 'viewSort',
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
        columnName: 'direction',
        columnType: 'varchar',
        action: 'create',
      },
    ],
  },
];

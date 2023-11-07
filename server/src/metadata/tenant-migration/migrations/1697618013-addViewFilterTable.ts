import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewFilterTable: TenantMigrationTableAction[] = [
  {
    name: 'viewFilter',
    action: 'create',
  },
  {
    name: 'viewFilter',
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
        columnName: 'operand',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'value',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'displayValue',
        columnType: 'varchar',
        action: 'create',
      },
    ],
  },
];

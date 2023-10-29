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
        name: 'operand',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'value',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'displayValue',
        type: 'varchar',
        action: 'create',
      },
    ],
  },
];

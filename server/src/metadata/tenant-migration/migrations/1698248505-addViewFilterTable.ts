import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewFilterTable: TenantMigrationTableAction[] = [
  {
    name: 'view_filter',
    action: 'create',
  },
  {
    name: 'view_filter',
    action: 'alter',
    columns: [
      {
        name: 'displayValue',
        type: 'text',
        action: 'create',
      },
      {
        name: 'key',
        type: 'text',
        action: 'create',
      },
      {
        name: 'name',
        type: 'text',
        action: 'create',
      },
      {
        name: 'operand',
        type: 'text',
        action: 'create',
      },
      {
        name: 'value',
        type: 'text',
        action: 'create',
      },
    ],
  },
];

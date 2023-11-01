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
        name: 'direction',
        type: 'varchar',
        action: 'create',
      },
    ],
  },
];

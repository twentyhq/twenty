import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewSortTable: TenantMigrationTableAction[] = [
  {
    name: 'viewSorts',
    action: 'create',
  },
  {
    name: 'viewSorts',
    action: 'alter',
    columns: [
      {
        name: 'direction',
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
    ],
  },
];

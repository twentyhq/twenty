import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

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
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'viewId',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'direction',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

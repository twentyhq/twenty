import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

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
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'viewId',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'operand',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'value',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'displayValue',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

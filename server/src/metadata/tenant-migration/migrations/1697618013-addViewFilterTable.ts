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
        columnName: 'fieldMetadataId',
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
      {
        columnName: 'viewId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'viewId',
        referencedTableName: 'view',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
    ],
  },
];

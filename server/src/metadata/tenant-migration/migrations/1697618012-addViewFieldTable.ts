import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

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
        columnName: 'fieldMetadataId',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'position',
        columnType: 'integer',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'isVisible',
        columnType: 'boolean',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'size',
        columnType: 'integer',
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

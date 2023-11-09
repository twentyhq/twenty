import {
  TenantMigrationTableAction,
  TenantMigrationColumnActionType,
} from 'src/database/typeorm/metadata/entities/tenant-migration.entity';

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
        columnName: 'viewId',
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
    ],
  },
];

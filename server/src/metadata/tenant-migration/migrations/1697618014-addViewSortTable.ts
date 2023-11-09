import {
  TenantMigrationTableAction,
  TenantMigrationColumnActionType,
} from 'src/database/typeorm/metadata/entities/tenant-migration.entity';

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
        columnName: 'direction',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

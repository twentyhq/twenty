import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addFavoriteTable: TenantMigrationTableAction[] = [
  {
    name: 'favorite',
    action: 'create',
  },
  {
    name: 'favorite',
    action: 'alter',
    columns: [
      {
        columnName: 'position',
        columnType: 'float',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'personId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'workspaceMemberId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

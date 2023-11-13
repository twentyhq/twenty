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
        columnName: 'companyId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addActivityTargetTable: TenantMigrationTableAction[] = [
  {
    name: 'activityTarget',
    action: 'create',
  },
  {
    name: 'activityTarget',
    action: 'alter',
    columns: [
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'activityId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'personId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

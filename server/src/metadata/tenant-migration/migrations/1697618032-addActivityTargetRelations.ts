import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addActivityTargetRelations: TenantMigrationTableAction[] = [
  {
    name: 'activityTarget',
    action: 'alter',
    columns: [
      {
        columnName: 'companyId',
        referencedTableName: 'company',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
      {
        columnName: 'personId',
        referencedTableName: 'person',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
      {
        columnName: 'activityId',
        referencedTableName: 'activity',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
    ],
  },
];

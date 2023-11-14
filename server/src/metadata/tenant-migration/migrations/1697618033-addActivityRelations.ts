import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addActivityRelations: TenantMigrationTableAction[] = [
  {
    name: 'activity',
    action: 'alter',
    columns: [
      {
        columnName: 'authorId',
        referencedTableName: 'workspaceMember',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
      {
        columnName: 'assigneeId',
        referencedTableName: 'workspaceMember',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
    ],
  },
];

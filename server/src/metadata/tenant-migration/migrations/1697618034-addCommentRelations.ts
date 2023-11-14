import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addCommentRelations: TenantMigrationTableAction[] = [
  {
    name: 'comment',
    action: 'alter',
    columns: [
      {
        columnName: 'authorId',
        referencedTableName: 'workspaceMember',
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

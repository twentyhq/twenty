import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWorkspaceMemberSettingRelations: TenantMigrationTableAction[] =
  [
    {
      name: 'workspaceMemberSetting',
      action: 'alter',
      columns: [
        {
          columnName: 'workspaceMemberId',
          referencedTableName: 'workspaceMember',
          referencedTableColumnName: 'id',
          action: TenantMigrationColumnActionType.RELATION,
        },
      ],
    },
  ];

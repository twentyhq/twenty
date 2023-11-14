import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWorkspaceMemberRelations: TenantMigrationTableAction[] = [
  {
    name: 'workspaceMember',
    action: 'alter',
    columns: [
      {
        columnName: 'settingId',
        referencedTableName: 'workspaceMemberSetting',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
    ],
  },
];

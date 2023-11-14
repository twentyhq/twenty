import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWorkspaceMemberSettingTable: TenantMigrationTableAction[] = [
  {
    name: 'workspaceMemberSetting',
    action: 'create',
  },
  {
    name: 'workspaceMemberSetting',
    action: 'alter',
    columns: [
      {
        columnName: 'colorScheme',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'locale',
        columnType: 'varchar',
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

import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWorkspaceMemberTable: TenantMigrationTableAction[] = [
  {
    name: 'workspaceMember',
    action: 'create',
  },
  {
    name: 'workspaceMember',
    action: 'alter',
    columns: [
      {
        columnName: 'firstName',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'lastName',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'avatarUrl',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
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
        columnName: 'allowImpersonation',
        columnType: 'boolean',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'userId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

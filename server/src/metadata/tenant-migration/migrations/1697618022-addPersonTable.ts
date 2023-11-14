import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPersonTable: TenantMigrationTableAction[] = [
  {
    name: 'person',
    action: 'create',
  },
  {
    name: 'person',
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
        columnName: 'email',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'linkedinUrl',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'xUrl',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'jobTitle',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'phone',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'city',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'avatarUrl',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

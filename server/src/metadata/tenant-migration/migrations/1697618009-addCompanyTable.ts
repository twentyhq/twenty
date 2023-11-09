import {
  TenantMigrationTableAction,
  TenantMigrationColumnActionType,
} from 'src/database/typeorm/metadata/entities/tenant-migration.entity';

export const addCompanyTable: TenantMigrationTableAction[] = [
  {
    name: 'company',
    action: 'create',
  },
  {
    name: 'company',
    action: 'alter',
    columns: [
      {
        columnName: 'name',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'domainName',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'address',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'employees',
        columnType: 'integer',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

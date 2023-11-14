import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

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
        columnName: 'annualRecurringRevenue',
        columnType: 'float',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'idealCustomerProfile',
        columnType: 'boolean',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'accountOwnerId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];

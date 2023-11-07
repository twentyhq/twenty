import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

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
        action: 'create',
      },
      {
        columnName: 'domainName',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'address',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'employees',
        columnType: 'integer',
        action: 'create',
      },
    ],
  },
];

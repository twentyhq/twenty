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
        name: 'name',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'domainName',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'address',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'employees',
        type: 'integer',
        action: 'create',
      },
    ],
  },
];

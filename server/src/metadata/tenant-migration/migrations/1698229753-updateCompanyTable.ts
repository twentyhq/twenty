import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const updateCompanyTable: TenantMigrationTableAction[] = [
  {
    name: 'companies',
    action: 'alter',
    columns: [
      {
        name: 'Linkedin URL',
        action: 'create',
        type: 'varchar',
      },
      {
        name: 'linkedinUrl',
        action: 'create',
        type: 'varchar',
      },
      {
        name: 'annualRecurringRevenue',
        type: 'integer',
        action: 'create',
      },
      {
        name: 'idealCustomerProfile',
        type: 'boolean',
        action: 'create',
      },
      {
        name: 'X URL',
        action: 'create',
        type: 'varchar',
      },
      {
        name: 'xUrl',
        action: 'create',
        type: 'varchar',
      },
    ],
  },
];

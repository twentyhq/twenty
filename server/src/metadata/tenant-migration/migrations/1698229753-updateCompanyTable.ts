import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const updateCompanyTable: TenantMigrationTableAction[] = [
  {
    name: 'company',
    action: 'alter',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        action: 'create',
      },
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
      {
        name: 'createdAt',
        action: 'create',
        type: 'timestamp',
      },
      {
        name: 'updatedAt',
        action: 'create',
        type: 'timestamp',
      },
    ],
  },
];

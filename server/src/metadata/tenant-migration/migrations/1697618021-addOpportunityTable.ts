import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addOpportunityTable: TenantMigrationTableAction[] = [
  {
    name: 'opportunity',
    action: 'create',
  },
  {
    name: 'opportunity',
    action: 'alter',
    columns: [],
  },
];

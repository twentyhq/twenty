import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addActivityTable: TenantMigrationTableAction[] = [
  {
    name: 'activity',
    action: 'create',
  },
  {
    name: 'activity',
    action: 'alter',
    columns: [],
  },
];

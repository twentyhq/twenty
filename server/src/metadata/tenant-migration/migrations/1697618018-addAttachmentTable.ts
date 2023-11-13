import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addAttachmentTable: TenantMigrationTableAction[] = [
  {
    name: 'attachment',
    action: 'create',
  },
  {
    name: 'attachment',
    action: 'alter',
    columns: [],
  },
];

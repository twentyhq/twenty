import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addCommentTable: TenantMigrationTableAction[] = [
  {
    name: 'comment',
    action: 'create',
  },
  {
    name: 'comment',
    action: 'alter',
    columns: [],
  },
];

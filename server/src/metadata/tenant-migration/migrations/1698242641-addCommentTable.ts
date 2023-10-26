import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addCommentTable: TenantMigrationTableAction[] = [
  {
    name: 'comments',
    action: 'create',
  },
  {
    name: 'comments',
    action: 'alter',
    columns: [
      {
        name: 'body',
        type: 'text',
        action: 'create',
      },
    ],
  },
];

import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addAttachmentTable: TenantMigrationTableAction[] = [
  {
    name: 'attachment',
    action: 'create',
  },
  {
    name: 'attachment',
    action: 'alter',
    columns: [
      {
        name: 'id',
        type: 'text',
        action: 'create',
      },
      {
        name: 'fullPath',
        type: 'text',
        action: 'create',
      },
      {
        name: 'type',
        type: 'text',
        action: 'create',
      },
      {
        name: 'name',
        type: 'text',
        action: 'create',
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

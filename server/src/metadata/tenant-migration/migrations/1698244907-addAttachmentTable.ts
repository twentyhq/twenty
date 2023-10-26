import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addAttachmentTable: TenantMigrationTableAction[] = [
  {
    name: 'attachments',
    action: 'create',
  },
  {
    name: 'attachments',
    action: 'alter',
    columns: [
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
    ],
  },
];

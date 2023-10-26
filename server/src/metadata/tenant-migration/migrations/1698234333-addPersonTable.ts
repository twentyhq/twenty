import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPersonTable: TenantMigrationTableAction[] = [
  {
    name: 'person',
    action: 'create',
  },
  {
    name: 'person',
    action: 'alter',
    columns: [
      {
        name: 'firstName',
        type: 'text',
        action: 'create',
      },
      {
        name: 'lastName',
        type: 'text',
        action: 'create',
      },
      {
        name: 'email',
        type: 'text',
        action: 'create',
      },
      {
        name: 'xUrl',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'X URL',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'jobTitle',
        type: 'text',
        action: 'create',
      },
      {
        name: 'phone',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'city',
        type: 'text',
        action: 'create',
      },
      {
        name: 'avatarUrl',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'Avatar URL',
        type: 'varchar',
        action: 'create',
      },
    ],
  },
];

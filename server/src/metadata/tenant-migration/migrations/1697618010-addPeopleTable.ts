import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPeopleTable: TenantMigrationTableAction[] = [
  {
    name: 'people',
    action: 'create',
  },
  {
    name: 'people',
    action: 'alter',
    columns: [
      {
        name: 'firstName',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'lastName',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'email',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'phone',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'city',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'jobTitle',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'linkedinUrl',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'xUrl',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'avatarUrl',
        type: 'varchar',
        action: 'create',
      },
    ],
  },
];

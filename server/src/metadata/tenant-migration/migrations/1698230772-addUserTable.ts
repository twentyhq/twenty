import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addUserTable: TenantMigrationTableAction[] = [
  {
    name: 'user',
    action: 'create',
  },
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
        name: 'emailVerified',
        type: 'boolean',
        action: 'create',
      },

      {
        name: 'avatarUrl',
        action: 'create',
        type: 'varchar',
      },
      {
        name: 'linkedinUrl',
        action: 'create',
        type: 'varchar',
      },
      {
        name: 'locale',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'phoneNumber',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'lastSeen',
        action: 'create',
        type: 'timestamp',
      },
      {
        name: 'disabled',
        action: 'create',
        type: 'boolean',
      },
      {
        name: 'canImpersonate',
        action: 'create',
        type: 'boolean',
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

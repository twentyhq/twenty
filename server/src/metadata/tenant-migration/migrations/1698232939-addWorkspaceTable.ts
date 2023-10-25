import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addUserSettingsTable: TenantMigrationTableAction[] = [
  {
    name: 'workspace',
    action: 'create',
  },
  {
    name: 'workspace',
    action: 'alter',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'domainName',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'Domain Name',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'displayName',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'logo',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'inviteHash',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'Invite Hash',
        type: 'varchar',
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

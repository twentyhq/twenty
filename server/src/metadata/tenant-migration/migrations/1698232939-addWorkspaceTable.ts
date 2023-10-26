import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWorkspaceTable: TenantMigrationTableAction[] = [
  {
    name: 'workspace',
    action: 'create',
  },
  {
    name: 'workspace',
    action: 'alter',
    columns: [
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
    ],
  },
];

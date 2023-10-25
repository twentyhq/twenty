import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addUserSettingsTable: TenantMigrationTableAction[] = [
  {
    name: 'user_settings',
    action: 'create',
  },
  {
    name: 'user_settings',
    action: 'alter',
    columns: [
      {
        name: 'id',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'colorScheme',
        type: 'varchar',
        action: 'create',
      },
      {
        name: 'locale',
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

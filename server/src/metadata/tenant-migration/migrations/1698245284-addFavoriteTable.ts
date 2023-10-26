import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addFavoriteTable: TenantMigrationTableAction[] = [
  {
    name: 'favorites',
    action: 'create',
  },
  {
    name: 'favorites',
    action: 'alter',
    columns: [
      {
        name: 'position',
        type: 'integer',
        action: 'create',
      },
    ],
  },
];

import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPipelineTable: TenantMigrationTableAction[] = [
  {
    name: 'pipeline',
    action: 'create',
  },
  {
    name: 'pipeline',
    action: 'alter',
    columns: [
      {
        name: 'name',
        type: 'text',
        action: 'create',
      },
      {
        name: 'icon',
        type: 'text',
        action: 'create',
      },
      {
        name: 'currency',
        type: 'text',
        action: 'create',
      },
    ],
  },
];

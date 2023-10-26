import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPipelineTable: TenantMigrationTableAction[] = [
  {
    name: 'pipelines',
    action: 'create',
  },
  {
    name: 'pipelines',
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

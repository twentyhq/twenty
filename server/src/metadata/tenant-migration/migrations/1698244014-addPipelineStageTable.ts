import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPipelineStageTable: TenantMigrationTableAction[] = [
  {
    name: 'pipeline_stages',
    action: 'create',
  },
  {
    name: 'pipeline_stages',
    action: 'alter',
    columns: [
      {
        name: 'name',
        type: 'text',
        action: 'create',
      },
      {
        name: 'type',
        type: 'text',
        action: 'create',
      },
      {
        name: 'color',
        type: 'text',
        action: 'create',
      },
      {
        name: 'index',
        type: 'integer',
        action: 'create',
      },
    ],
  },
];

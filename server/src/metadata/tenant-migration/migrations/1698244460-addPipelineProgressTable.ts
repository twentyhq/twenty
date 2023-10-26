import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPipelineProgressTable: TenantMigrationTableAction[] = [
  {
    name: 'pipeline_progress',
    action: 'create',
  },
  {
    name: 'pipeline_progress',
    action: 'alter',
    columns: [
      {
        name: 'amount',
        type: 'integer',
        action: 'create',
      },
      {
        name: 'closeDate',
        type: 'timestamp',
        action: 'create',
      },
      {
        name: 'probability',
        type: 'integer',
        action: 'create',
      },
    ],
  },
];
